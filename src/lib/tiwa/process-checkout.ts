import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { initiateMoolrePayment } from "@/lib/tiwa/moolre-payment";
import { resolveSupabaseProductId } from "@/lib/tiwa/resolve-product";
import { sendOrderPlacedNotification } from "@/lib/tiwa/notifications";
import { minorToMajor } from "@/lib/sync/money";
import { siteConfig } from "@/lib/site";
import { isMoolreConfigured } from "@/lib/moolre";

export type TiwaCartLine = {
  id: string;
  productId?: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  variantName?: string | null;
  imageUrl?: string | null;
};

export type TiwaCheckoutInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  deliveryMethod: "pickup" | "doorstep";
  userId?: string | null;
  saveAddress?: boolean;
  items: TiwaCartLine[];
};

export type TiwaCheckoutResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      redirectUrl: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      fieldErrors?: Record<string, string>;
    };

function buildAddress(body: TiwaCheckoutInput) {
  if (body.deliveryMethod === "pickup") {
    return {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: siteConfig.contact.streetAddress,
      city: siteConfig.contact.city,
      region: siteConfig.contact.region,
      delivery_method: "pickup",
      store: siteConfig.shortName,
    };
  }

  return {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    address: body.address?.trim() || "",
    city: body.city?.trim() || "",
    region: body.region?.trim() || "",
    delivery_method: "doorstep",
  };
}

export function validateTiwaCheckout(body: TiwaCheckoutInput) {
  const fieldErrors: Record<string, string> = {};
  if (!body.firstName?.trim()) fieldErrors.firstName = "First name is required";
  if (!body.lastName?.trim()) fieldErrors.lastName = "Last name is required";
  if (!body.email?.trim()) fieldErrors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(body.email)) fieldErrors.email = "Invalid email";
  if (!body.phone?.trim()) fieldErrors.phone = "Phone is required";
  if (!Array.isArray(body.items) || body.items.length === 0) {
    fieldErrors.items = "Your cart is empty";
  }
  if (body.deliveryMethod === "doorstep") {
    if (!body.address?.trim()) fieldErrors.address = "Address is required";
    if (!body.city?.trim()) fieldErrors.city = "City is required";
    if (!body.region?.trim()) fieldErrors.region = "Region is required";
  }
  return fieldErrors;
}

export function isTiwaCheckoutPayload(body: unknown): body is TiwaCheckoutInput {
  return (
    !!body &&
    typeof body === "object" &&
    "deliveryMethod" in body &&
    Array.isArray((body as TiwaCheckoutInput).items)
  );
}

export async function processTiwaCheckout(
  body: TiwaCheckoutInput,
  requestOrigin: string
): Promise<TiwaCheckoutResult> {
  if (!isMoolreConfigured()) {
    return {
      ok: false,
      status: 500,
      error: "Mobile Money payment is not configured.",
    };
  }

  const fieldErrors = validateTiwaCheckout(body);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      status: 400,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const subtotal = body.items.reduce(
    (sum, item) => sum + minorToMajor(item.price) * item.quantity,
    0
  );
  const total = subtotal;
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const trackingId = Array.from(
    { length: 6 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");
  const address = buildAddress(body);

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: body.userId || null,
        email: body.email.trim(),
        phone: body.phone.trim(),
        status: "pending",
        payment_status: "pending",
        currency: "GHS",
        subtotal,
        tax_total: 0,
        shipping_total: 0,
        discount_total: 0,
        total,
        shipping_method: body.deliveryMethod,
        payment_method: "moolre",
        shipping_address: address,
        billing_address: address,
        metadata: {
          guest_checkout: !body.userId,
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          tracking_number: `MOT-${trackingId}`,
          store: siteConfig.shortName,
          save_address: !!body.saveAddress,
          payment_method: "moolre",
        },
      })
      .select("id, order_number, email, total, payment_status")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Could not create order");
    }

    const orderItems = [];
    for (const item of body.items) {
      const productId = await resolveSupabaseProductId(item);
      if (!productId) {
        throw new Error(
          `Product not found: ${item.name}. Please remove it from your cart and try again.`
        );
      }

      const unitPrice = minorToMajor(item.price);
      orderItems.push({
        order_id: order.id,
        product_id: productId,
        product_name: item.name,
        variant_name: item.variantName ?? null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        metadata: {
          image: item.imageUrl ?? null,
          slug: item.slug,
        },
      });
    }

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new Error(itemsError.message || "Could not save order items");
    }

    const fullName = `${body.firstName.trim()} ${body.lastName.trim()}`.trim();
    try {
      await supabaseAdmin.rpc("upsert_customer_from_order", {
        p_email: body.email.trim(),
        p_phone: body.phone.trim(),
        p_full_name: fullName,
        p_first_name: body.firstName.trim(),
        p_last_name: body.lastName.trim(),
        p_user_id: body.userId || null,
        p_address: address,
      });
    } catch (rpcErr) {
      console.error("[tiwa-checkout] customer upsert:", rpcErr);
    }

    const paymentResult = await initiateMoolrePayment(
      {
        orderNumber: order.order_number,
        total: Number(order.total),
        email: order.email,
        customerEmail: body.email.trim(),
        paymentStatus: order.payment_status,
      },
      requestOrigin
    );

    if (!paymentResult.success) {
      throw new Error(
        paymentResult.message || "Failed to start Mobile Money payment"
      );
    }

    void sendOrderPlacedNotification(
      {
        id: order.id,
        order_number: order.order_number,
        email: order.email,
        phone: body.phone.trim(),
        total: order.total,
        shipping_address: address,
        metadata: {
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          tracking_number: `MOT-${trackingId}`,
        },
      },
      paymentResult.url
    );

    return {
      ok: true,
      orderId: order.id,
      orderNumber,
      redirectUrl: paymentResult.url,
    };
  } catch (err: unknown) {
    console.error("[tiwa-checkout]", err);
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to place order",
    };
  }
}
