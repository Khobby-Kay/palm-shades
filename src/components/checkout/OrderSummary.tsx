"use client";

import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import { Placeholder } from "@/components/ui/Placeholder";
import { useCart, cartSelectors } from "@/store/cart";
import { calculateTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/orders";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { formatPrice } from "@/lib/utils";
import type { ShippingMethod } from "@/lib/validators/checkout";

export function OrderSummary({
  shippingMethod = "pickup",
  couponDiscount = 0,
  appliedCoupon = null,
}: {
  shippingMethod?: ShippingMethod;
  couponDiscount?: number;
  appliedCoupon?: string | null;
}) {
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const hydrated = useCart((s) => s.hasHydrated);
  const totals = calculateTotals(items, {
    shippingMethod,
    discount: couponDiscount,
  });

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
          <Link
            href="/cart"
            className="text-xs font-semibold uppercase tracking-wide text-primary-700 hover:text-primary-800"
          >
            Edit cart
          </Link>
        </div>

        {hydrated && items.length > 0 ? (
          <>
            <ul className="mt-5 max-h-[280px] space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2] p-1 ring-1 ring-gray-200">
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
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatPrice(item.price, { currency: item.currency })} each
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity, {
                      currency: item.currency,
                    })}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">
                {shippingMethod === "pickup" ? "Store pickup" : "Doorstep delivery"}
              </span>
              {shippingMethod === "doorstep" && remaining > 0 ? (
                <p className="mt-1">
                  Add {formatPrice(remaining, { currency: totals.currency })} more for
                  free delivery.
                </p>
              ) : shippingMethod === "doorstep" ? (
                <p className="mt-1 text-primary-700">Complimentary delivery unlocked.</p>
              ) : (
                <p className="mt-1">No delivery fee for boutique pickup.</p>
              )}
              {shippingMethod === "doorstep" && remaining > 0 ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <Row
                k="Subtotal"
                v={formatPrice(totals.subtotal, { currency: totals.currency })}
              />
              <Row
                k="Shipping"
                v={
                  totals.shipping === 0
                    ? "Free"
                    : formatPrice(totals.shipping, { currency: totals.currency })
                }
              />
              {totals.discount > 0 ? (
                <Row
                  k={appliedCoupon ? `Discount (${appliedCoupon})` : "Discount"}
                  v={`− ${formatPrice(totals.discount, { currency: totals.currency })}`}
                />
              ) : null}
              <div className="my-2 border-t border-gray-200" />
              <div className="flex items-baseline justify-between">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {formatPrice(totals.total, { currency: totals.currency })}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-6 text-sm text-gray-500">Loading your cart…</p>
        )}
      </div>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-600">{k}</dt>
      <dd className="font-medium text-gray-900">{v}</dd>
    </div>
  );
}
