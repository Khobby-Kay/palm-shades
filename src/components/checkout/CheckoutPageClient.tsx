"use client";

import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { ShippingMethod } from "@/lib/validators/checkout";

export function CheckoutPageClient({
  stripeEnabled,
  moolreEnabled,
}: {
  stripeEnabled: boolean;
  moolreEnabled: boolean;
}) {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("pickup");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  return (
    <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1.4fr,1fr] lg:gap-12">
      <div className="order-2 lg:order-1">
        <CheckoutForm
          stripeEnabled={stripeEnabled}
          moolreEnabled={moolreEnabled}
          shippingMethod={shippingMethod}
          onShippingMethodChange={setShippingMethod}
          appliedCoupon={appliedCoupon}
          onCouponApplied={(code, discount) => {
            setAppliedCoupon(code);
            setCouponDiscount(discount);
          }}
          onCouponCleared={() => {
            setAppliedCoupon(null);
            setCouponDiscount(0);
          }}
        />
      </div>
      <div className="order-1 lg:order-2">
        <OrderSummary
          shippingMethod={shippingMethod}
          couponDiscount={couponDiscount}
          appliedCoupon={appliedCoupon}
        />
      </div>
    </div>
  );
}
