import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Package, ArrowUpRight, Sparkles } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { Placeholder } from "@/components/ui/Placeholder";
import { PaymentInstructions } from "@/components/checkout/PaymentInstructions";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentMethodLabel } from "@/lib/orders";
import { markOrderPaid } from "@/lib/order-payment";
import { canViewOrderDetails } from "@/lib/security/order-access";
import {
  getPaymentStatus,
  isMoolrePaymentSuccessful,
} from "@/lib/moolre";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { formatPrice } from "@/lib/utils";
import { CheckoutSuccessReceipt } from "@/components/receipt/CheckoutSuccessReceipt";
import type { CustomerReceiptData } from "@/lib/customer-receipt";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your Palm Shades order has been confirmed.",
};

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { moolre?: string; token?: string };
}) {
  const session = await auth();

  let order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const allowed = canViewOrderDetails(order, session, searchParams.token);
  if (!allowed) notFound();

  if (
    order.paymentMethod === "MOOLRE" &&
    order.paymentStatus === "PENDING" &&
    searchParams.moolre === "1"
  ) {
    const status = await getPaymentStatus(order.orderNumber);
    if (isMoolrePaymentSuccessful(status)) {
      const updated = await markOrderPaid(
        order.id,
        status?.transactionid ?? order.moolreReference ?? undefined
      );
      if (updated) order = updated;
    }
  }

  const receiptData: CustomerReceiptData = {
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    customerName: order.fullName,
    email: order.email,
    phone: order.phone,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    currency: order.currency,
    paymentMethod: paymentMethodLabel(order.paymentMethod),
    paymentStatus: order.paymentStatus,
    shippingLines: [
      order.shippingLine1,
      order.shippingLine2,
      [order.shippingCity, order.shippingRegion, order.shippingCountry]
        .filter(Boolean)
        .join(", "),
    ].filter(Boolean) as string[],
  };

  return (
    <>
      <ClearCartOnMount />

      {/* Hero confirmation */}
      <section className="relative isolate overflow-hidden border-b border-blush-200/60 bg-gradient-luxe">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-blush" />
        <Container className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto inline-grid h-16 w-16 place-items-center rounded-full bg-white text-primary-600 shadow-luxe">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
              {order.paymentStatus === "PAID"
                ? "Order confirmed"
                : "Order received"}
            </p>
            <h1 className="mt-4 font-display text-display-lg text-charcoal">
              {order.paymentStatus === "PAID"
                ? "Thank you, your order is in the works."
                : "Almost there — one final step."}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-charcoal-light md:text-lg">
              {order.paymentStatus === "PAID"
                ? "We've sent a confirmation to your email. Sit back — your order is being beautifully prepared and packaged."
                : "Your order has been reserved. Please complete payment using the instructions below and we'll dispatch it right away."}
            </p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-blush-200 bg-white/80 px-5 py-2.5 backdrop-blur">
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-light">
                Order
              </span>
              <span className="font-display text-lg text-charcoal">
                {order.orderNumber}
              </span>
            </div>
            <div className="mt-6">
              <CheckoutSuccessReceipt data={receiptData} />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
          {/* Items */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-50 text-primary-700">
                  <Package className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl text-charcoal">
                  Your order
                </h2>
              </div>

              <ul className="mt-6 divide-y divide-blush-200/60">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] p-1.5 ring-1 ring-blush-200/60">
                      {item.imageUrl ? (
                        <SmartImage
                          src={item.imageUrl}
                          alt={item.name}
                          variant="ivory"
                          fit="contain"
                          sizes={IMAGE_SIZES.cartThumb}
                        />
                      ) : (
                        <Placeholder variant="ivory" className="h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium text-charcoal">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal-light">
                        {formatPrice(item.price, { currency: order.currency })} · qty {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium text-charcoal">
                      {formatPrice(item.price * item.quantity, {
                        currency: order.currency,
                      })}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-blush-200/60 pt-6 text-sm">
                <Row k="Subtotal" v={formatPrice(order.subtotal, { currency: order.currency })} />
                <Row
                  k="Shipping"
                  v={
                    order.shipping === 0
                      ? "Free"
                      : formatPrice(order.shipping, { currency: order.currency })
                  }
                />
                {order.discount > 0 ? (
                  <Row k="Discount" v={`− ${formatPrice(order.discount, { currency: order.currency })}`} />
                ) : null}
                <div className="my-2 border-t border-blush-200/60" />
                <div className="flex items-baseline justify-between">
                  <dt className="text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
                    Total
                  </dt>
                  <dd className="font-display text-3xl text-charcoal">
                    {formatPrice(order.total, { currency: order.currency })}
                  </dd>
                </div>
              </dl>
            </div>

            <PaymentInstructions
              paymentMethod={order.paymentMethod}
              paymentStatus={order.paymentStatus}
              total={order.total}
              currency={order.currency}
              orderNumber={order.orderNumber}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Delivery */}
            <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-50 text-primary-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <h2 className="font-display text-xl text-charcoal">Delivery to</h2>
              </div>
              <div className="mt-5 text-sm text-charcoal">
                <p className="font-medium">{order.fullName}</p>
                <p className="text-charcoal-light">{order.email}</p>
                <p className="text-charcoal-light">{order.phone}</p>
                <p className="mt-3 text-charcoal-light">
                  {order.shippingLine1}
                  {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                  <br />
                  {order.shippingCity}
                  {order.shippingRegion ? `, ${order.shippingRegion}` : ""}
                  <br />
                  {order.shippingCountry}
                </p>
              </div>
            </div>

            {/* Order meta */}
            <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60">
              <h2 className="font-display text-xl text-charcoal">Order details</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <Row k="Order #" v={order.orderNumber} />
                <Row
                  k="Date"
                  v={new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <Row k="Payment" v={paymentMethodLabel(order.paymentMethod)} />
                <Row k="Status" v={pretty(order.status)} />
              </dl>
            </div>

            {/* Up next */}
            <div className="rounded-3xl border border-blush-200/70 bg-blush-50/50 p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary-700">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="font-display text-xl text-charcoal">While you wait…</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-charcoal-light">
                Book a boutique ritual to go with your new essentials — signature
                blowouts, makeup, manicures &amp; bespoke treatments.
              </p>
              <LinkButton href="/services" size="md" variant="primary" className="mt-5">
                Browse boutique services
                <ArrowUpRight className="h-4 w-4" />
              </LinkButton>
              <Link
                href="/shop"
                className="mt-3 block text-center text-xs uppercase tracking-[0.22em] text-charcoal-light hover:text-charcoal"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-charcoal-light">{k}</dt>
      <dd className="font-medium text-charcoal">{v}</dd>
    </div>
  );
}

function pretty(status: string) {
  return status
    .toLowerCase()
    .replace(/(^|\s|_)\w/g, (m) => m.replace("_", " ").toUpperCase());
}
