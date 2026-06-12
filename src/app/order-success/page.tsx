"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/tiwa/supabase";
import { siteConfig } from "@/lib/site";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { CoverImage } from "@/components/ui/CoverImage";
import { CustomerOrderReceiptPrint } from "@/components/receipt/CustomerOrderReceiptPrint";
import type { CustomerReceiptData } from "@/lib/customer-receipt";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const paymentSuccess = searchParams.get("payment_success");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        const { data: orderData, error } = await supabase
          .from("orders")
          .select(`*, order_items (*)`)
          .eq("order_number", orderNumber)
          .single();

        if (error) throw error;
        setOrder(orderData);

        if (
          paymentSuccess === "true" &&
          orderData &&
          orderData.payment_status !== "paid"
        ) {
          verifyPayment(orderNumber);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber, paymentSuccess]);

  const verifyPayment = async (orderNum: string) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const { data: refreshed } = await supabase
      .from("orders")
      .select("*, order_items (*)")
      .eq("order_number", orderNum)
      .single();

    if (refreshed?.payment_status === "paid") {
      setOrder(refreshed);
      return;
    }

    try {
      const res = await fetch("/api/payment/moolre/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNum }),
      });

      const result = await res.json();
      if (result.success && result.payment_status === "paid") {
        const { data: updated } = await supabase
          .from("orders")
          .select("*, order_items (*)")
          .eq("order_number", orderNum)
          .single();
        if (updated) setOrder(updated);
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-loader-4-line mb-4 block animate-spin text-4xl text-primary-600"></i>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-error-warning-line mb-4 block text-4xl text-red-500"></i>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="mb-6 text-gray-600">
            We couldn&apos;t locate the order details.
          </p>
          <Link
            href="/shop"
            className="font-semibold text-primary-700 hover:underline"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  const orderDate = new Date(String(order.created_at)).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const estimatedDelivery = new Date(
    new Date(String(order.created_at)).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pointsEarned = Math.floor(Number(order.total) / 10);
  const orderItems = (order.order_items as Array<Record<string, unknown>>) || [];
  const shippingAddress = order.shipping_address as Record<string, string> | null;
  const customerName = shippingAddress
    ? `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim() ||
      shippingAddress.full_name ||
      String(order.email)
    : String(order.email);

  const receiptData: CustomerReceiptData = {
    orderNumber: String(order.order_number),
    orderDate: orderDate,
    customerName,
    email: String(order.email),
    phone: String(order.phone || shippingAddress?.phone || ""),
    items: orderItems.map((item) => ({
      name: String(item.product_name),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      variant: item.variant_name ? String(item.variant_name) : null,
    })),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping_total),
    tax: Number(order.tax_total || 0),
    discount: Number(order.discount_total || 0),
    total: Number(order.total),
    paymentMethod: String(order.payment_method || ""),
    paymentStatus: String(order.payment_status || ""),
    shippingLines: shippingAddress
      ? [
          shippingAddress.address,
          [shippingAddress.city, shippingAddress.region].filter(Boolean).join(", "),
        ].filter(Boolean) as string[]
      : undefined,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-0">
      <ClearCartOnMount />
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <i
                className={`ri-${["heart", "star", "gift"][i % 3]}-fill text-xl opacity-70 ${i % 2 === 0 ? "text-primary-500" : "text-amber-500"}`}
              ></i>
            </div>
          ))}
        </div>
      )}

      <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-6 rounded-2xl bg-white p-4 text-center shadow-xl sm:mb-8 sm:p-8 md:p-12">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 sm:mb-6 sm:h-24 sm:w-24">
              <i className="ri-checkbox-circle-fill text-5xl text-primary-600 sm:text-6xl"></i>
            </div>

            <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
              Order Confirmed!
            </h1>
            <p className="mb-2 text-base text-gray-600 sm:text-xl">
              Thank you for shopping with {siteConfig.shortName}.
            </p>
            <p className="mb-6 text-sm text-gray-500 sm:mb-8">
              We&apos;re processing your order now.
            </p>

            <div className="mb-6 rounded-xl bg-primary-50 p-4 sm:mb-8 sm:p-6">
              <div className="grid gap-4 text-center sm:gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Order Number</p>
                  <p className="break-all text-base font-bold text-gray-900 sm:text-lg">
                    {String(order.order_number)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">Order Date</p>
                  <p className="text-lg font-bold text-gray-900">{orderDate}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-bold text-primary-700">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col justify-center gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/account/orders"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-primary-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-primary-700 sm:w-auto sm:px-8 sm:py-4"
              >
                <i className="ri-file-list-3-line mr-2"></i>
                View Order
              </Link>
              <CustomerOrderReceiptPrint data={receiptData} />
              <Link
                href="/shop"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border-2 border-gray-300 px-6 py-3.5 font-semibold text-gray-700 transition-colors hover:border-gray-400 sm:w-auto sm:px-8 sm:py-4"
              >
                <i className="ri-shopping-bag-line mr-2"></i>
                Continue Shopping
              </Link>
            </div>

            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex w-full flex-col items-center gap-3 text-center sm:w-auto sm:flex-row sm:space-x-4 sm:text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500">
                    <i className="ri-star-fill text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 sm:text-lg">
                      You Earned {pointsEarned} Points!
                    </p>
                    <p className="text-sm text-gray-600">
                      Join our loyalty program to redeem at Palm Shades.
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/signup"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600 sm:w-auto"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={String(item.id)}
                    className="flex items-start gap-3 sm:items-center sm:gap-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:h-20 sm:w-20">
                      <CoverImage
                        src={(item.metadata as { image?: string })?.image}
                        alt={String(item.product_name)}
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-gray-900">
                        {String(item.product_name)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {String(item.quantity)}
                      </p>
                      {item.variant_name ? (
                        <p className="text-xs text-gray-500">
                          {String(item.variant_name)}
                        </p>
                      ) : null}
                      {(item.metadata as { preorder_shipping?: string })
                        ?.preorder_shipping ? (
                        <p className="mt-1 inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                          <i className="ri-time-line"></i>
                          {
                            (item.metadata as { preorder_shipping: string })
                              .preorder_shipping
                          }
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-bold text-gray-900 sm:text-base">
                      GH₵{Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>GH₵{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>GH₵{Number(order.shipping_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900 sm:text-xl">
                  <span>Total Paid</span>
                  <span>GH₵{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">
                Delivery Details
              </h2>
              {shippingAddress ? (
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Recipient</p>
                    <p className="font-semibold text-gray-900">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{shippingAddress.address}</p>
                    <p className="text-gray-900">
                      {shippingAddress.city}, {shippingAddress.region}
                    </p>
                    {shippingAddress.postalCode ? (
                      <p className="text-gray-900">
                        {shippingAddress.postalCode}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{String(order.phone)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{String(order.email)}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="mb-3 font-semibold text-gray-900">
                  What&apos;s Next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <i className="ri-mail-line mt-1 text-primary-700"></i>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Email Confirmation
                      </p>
                      <p className="text-sm text-gray-600">
                        Sent to {String(order.email)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-box-3-line mt-1 text-primary-700"></i>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Processing
                      </p>
                      <p className="text-sm text-gray-600">
                        We&apos;ll prepare your order at {siteConfig.shortName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-truck-line mt-1 text-primary-700"></i>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Shipping Updates
                      </p>
                      <p className="text-sm text-gray-600">
                        Track via email &amp; SMS
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center sm:mt-8">
            <p className="mb-4 text-gray-600">Need help with your order?</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center font-semibold text-primary-700 hover:text-primary-900"
              >
                <i className="ri-customer-service-line mr-1"></i>
                Contact Support
              </Link>
              <Link
                href="/account/orders"
                className="inline-flex min-h-[44px] items-center font-semibold text-primary-700 hover:text-primary-900"
              >
                <i className="ri-question-line mr-1"></i>
                Order Help
              </Link>
              <Link
                href="/policies/returns"
                className="inline-flex min-h-[44px] items-center font-semibold text-primary-700 hover:text-primary-900"
              >
                <i className="ri-arrow-left-right-line mr-1"></i>
                Returns Policy
              </Link>
            </div>
            <p className="mx-auto mt-6 max-w-sm px-2 text-xs leading-relaxed text-gray-500">
              {siteConfig.contact.phone}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> · </span>
              {siteConfig.contact.address}
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
