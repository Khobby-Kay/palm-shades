import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckoutValidationError,
  createOrderWithStock,
  validateCheckoutCart,
} from "@/lib/checkout/validate-cart";
import { CouponError, validateCoupon } from "@/lib/checkout/coupon";
import {
  checkoutFullName,
  checkoutSchema,
} from "@/lib/validators/checkout";
import { calculateTotals, generateOrderNumber } from "@/lib/orders";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isMoolreConfigured } from "@/lib/moolre";
import { siteConfig } from "@/lib/site";
import { notifyOrderPlaced } from "@/lib/notifications/customer";
import { syncOrderToSupabase } from "@/lib/sync/order-to-supabase";
import {
  createOrderAccessToken,
  orderSuccessPath,
} from "@/lib/security/order-access";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { fetchSupabaseOrderByRef } from "@/lib/tiwa/fetch-order";
import {
  isTiwaCheckoutPayload,
  processTiwaCheckout,
} from "@/lib/tiwa/process-checkout";
import type { PaymentMethod } from "@/lib/types/enums";

export const dynamic = "force-dynamic";

function resolvePaymentMethod(method: PaymentMethod): PaymentMethod {
  if (method === "MOBILE_MONEY" && isMoolreConfigured()) {
    return "MOOLRE";
  }
  return method;
}

function isOnlinePayment(method: PaymentMethod): boolean {
  return method === "STRIPE" || method === "MOOLRE";
}

function resolveShippingFields(input: {
  shippingMethod: "pickup" | "doorstep";
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  shippingCity?: string | null;
  shippingRegion?: string | null;
  shippingCountry: string;
}) {
  if (input.shippingMethod === "pickup") {
    return {
      shippingLine1: siteConfig.contact.streetAddress,
      shippingLine2: "Store pickup at Palm Shades",
      shippingCity: siteConfig.contact.city,
      shippingRegion: siteConfig.contact.region,
      shippingCountry: input.shippingCountry,
    };
  }

  return {
    shippingLine1: input.shippingLine1 ?? "",
    shippingLine2: input.shippingLine2 ?? null,
    shippingCity: input.shippingCity ?? "",
    shippingRegion: input.shippingRegion ?? null,
    shippingCountry: input.shippingCountry,
  };
}

function tiwaSuccessUrl(orderNumber: string, email: string, paymentSuccess?: boolean) {
  const params = new URLSearchParams({
    order: orderNumber,
    token: createOrderAccessToken(orderNumber, email),
  });
  if (paymentSuccess) params.set("payment_success", "true");
  return `/order-success?${params.toString()}`;
}

function notifyNewOrder(
  order: { orderNumber: string },
  input: {
    fullName: string;
    email: string;
    phone: string;
    paymentMethod: string;
    shippingLine1: string;
    shippingLine2?: string | null;
    shippingCity: string;
    shippingRegion?: string | null;
    shippingCountry: string;
  },
  totals: ReturnType<typeof calculateTotals>,
  cartLines: Array<{ name: string; price: number; quantity: number }>,
  paymentStatus: "PENDING" | "PAID" = "PENDING"
) {
  notifyOrderPlaced({
    orderNumber: order.orderNumber,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    total: totals.total,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    currency: totals.currency,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    shippingLine1: input.shippingLine1,
    shippingLine2: input.shippingLine2 ?? null,
    shippingCity: input.shippingCity,
    shippingRegion: input.shippingRegion ?? null,
    shippingCountry: input.shippingCountry,
    items: cartLines.map((it) => ({
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "checkout", 8, 60_000);
  if (limited) return limited;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Storefront Tiwa checkout (Supabase + Moolre) — used by /checkout page
  if (isTiwaCheckoutPayload(payload)) {
    const result = await processTiwaCheckout(
      payload,
      new URL(req.url).origin
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, fieldErrors: result.fieldErrors },
        { status: result.status }
      );
    }
    return NextResponse.json({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      redirectUrl: result.redirectUrl,
    });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const paymentMethod = resolvePaymentMethod(input.paymentMethod);
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const fullName = checkoutFullName(input);
  const shipping = resolveShippingFields(input);

  let cartLines;
  try {
    cartLines = await validateCheckoutCart(input.items);
  } catch (err) {
    if (err instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: err.message, fieldErrors: err.fieldErrors },
        { status: 400 }
      );
    }
    throw err;
  }

  const baseTotals = calculateTotals(cartLines, {
    shippingMethod: input.shippingMethod,
  });

  let discountPesewas = 0;
  let appliedCoupon: Awaited<ReturnType<typeof validateCoupon>> | null = null;

  if (input.couponCode?.trim()) {
    try {
      appliedCoupon = await validateCoupon(
        input.couponCode,
        baseTotals.subtotal,
        baseTotals.shipping
      );
      discountPesewas = appliedCoupon.discountPesewas;
    } catch (err) {
      const message =
        err instanceof CouponError ? err.message : "Invalid coupon code.";
      return NextResponse.json(
        { error: message, fieldErrors: { couponCode: message } },
        { status: 400 }
      );
    }
  }

  const totals = calculateTotals(cartLines, {
    shippingMethod: input.shippingMethod,
    discount: discountPesewas,
  });

  const orderNumber = generateOrderNumber();
  const syncExtras = {
    shippingMethod: input.shippingMethod,
    firstName: input.firstName,
    lastName: input.lastName,
    couponCode: appliedCoupon?.code ?? null,
  };

  if (paymentMethod === "STRIPE" && !isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Card payment is not yet available. Please choose Mobile Money, Bank Transfer, or Cash on Delivery.",
      },
      { status: 400 }
    );
  }

  if (paymentMethod === "MOOLRE" && !isMoolreConfigured()) {
    return NextResponse.json(
      {
        error:
          "Online Mobile Money is not configured yet. Please choose another payment method.",
      },
      { status: 400 }
    );
  }

  let order;
  try {
    order = await createOrderWithStock(
      {
      userId,
      orderNumber,
        fullName,
      email: input.email,
      phone: input.phone,
      guestEmail: input.email,
      guestPhone: input.phone,
        shippingLine1: shipping.shippingLine1,
        shippingLine2: shipping.shippingLine2,
        shippingCity: shipping.shippingCity,
        shippingRegion: shipping.shippingRegion,
        shippingCountry: shipping.shippingCountry,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      currency: totals.currency,
        paymentMethod,
      paymentStatus: "PENDING",
        status: paymentMethod === "CASH_ON_DELIVERY" ? "PROCESSING" : "PENDING",
      notes: input.notes ?? null,
      items: {
          create: cartLines.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            variantName: it.variantName,
            productCode: it.productCode,
            variantSku: it.variantSku,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
            imageUrl: it.imageUrl,
        })),
      },
    },
      cartLines
    );
  } catch (err) {
    if (err instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: err.message, fieldErrors: err.fieldErrors },
        { status: 400 }
      );
    }
    throw err;
  }

  if (appliedCoupon) {
    try {
      const { data: row } = await supabaseAdmin
        .from("coupons")
        .select("usage_count")
        .eq("id", appliedCoupon.couponId)
        .single();
      await supabaseAdmin
        .from("coupons")
        .update({ usage_count: (row?.usage_count ?? 0) + 1 })
        .eq("id", appliedCoupon.couponId);
    } catch (e) {
      console.error("[checkout] coupon usage increment:", e);
    }
  }

  const notifyInput = {
    fullName,
      email: input.email,
    phone: input.phone,
    paymentMethod,
    ...shipping,
  };

  // Manual / offline payment methods
  if (!isOnlinePayment(paymentMethod)) {
    try {
      await syncOrderToSupabase(order.id, syncExtras);
    } catch (e) {
      console.error("[sync] order-to-supabase:", e);
    }

    notifyNewOrder(order, notifyInput, totals, cartLines);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      redirectUrl: tiwaSuccessUrl(order.orderNumber, input.email),
    });
  }

  // Moolre — Tiwa flow: sync to Supabase first, then /api/payment/moolre
  if (paymentMethod === "MOOLRE") {
    try {
      await syncOrderToSupabase(order.id, syncExtras);

      const { data: syncedOrder, error: syncLookupError } =
        await fetchSupabaseOrderByRef(order.orderNumber, "id, order_number");
      if (syncLookupError || !syncedOrder) {
        throw new Error(
          "Order could not be prepared for Mobile Money payment. Please try again."
        );
      }

      const origin = siteConfig.url.replace(/\/+$/, "");
      const paymentRes = await fetch(`${origin}/api/payment/moolre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderNumber,
          customerEmail: input.email,
        }),
      });

      const paymentResult = await paymentRes.json();
      if (!paymentRes.ok || !paymentResult.success || !paymentResult.url) {
        throw new Error(paymentResult.message || "Failed to start Mobile Money payment");
      }

      if (paymentResult.reference) {
        await prisma.order.update({
          where: { id: order.id },
          data: { moolreReference: paymentResult.reference },
        });
      }

      notifyNewOrder(order, notifyInput, totals, cartLines);

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        redirectUrl: paymentResult.url,
      });
    } catch (err: unknown) {
      console.error("Moolre checkout failed", err);
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
      const message =
        err instanceof Error ? err.message : "Could not start Moolre payment.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Stripe Checkout Session
  void syncOrderToSupabase(order.id, syncExtras).catch((e) =>
    console.error("[sync] order-to-supabase:", e)
  );

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Card payment is not configured." },
      { status: 500 }
    );
  }

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: cartLines.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency: totals.currency.toLowerCase(),
          unit_amount: it.price,
          product_data: {
            name: it.name,
            images: it.imageUrl ? [it.imageUrl] : undefined,
          },
        },
      })),
      ...(totals.shipping > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Standard delivery",
                  fixed_amount: {
                    amount: totals.shipping,
                    currency: totals.currency.toLowerCase(),
                  },
                },
              },
            ],
          }
        : {}),
      customer_email: input.email,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${siteConfig.url}${orderSuccessPath(order.orderNumber, input.email)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/checkout?cancelled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: stripeSession.payment_intent as string | null },
    });

    notifyNewOrder(order, notifyInput, totals, cartLines);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      redirectUrl: stripeSession.url,
    });
  } catch (err: unknown) {
    console.error("Stripe checkout failed", err);
    const message =
      err instanceof Error ? err.message : "Could not start card payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
