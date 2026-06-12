"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { PaymentMethodPicker } from "@/components/checkout/PaymentMethodPicker";
import { useCart } from "@/store/cart";
import type { PaymentMethod } from "@/lib/types/enums";
import type { ShippingMethod } from "@/lib/validators/checkout";

const PICKUP_ADDRESS =
  "Pantang–Abokobi Road, Police Barrier · Accra, Ghana";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Brong-Ahafo",
  "Ahafo",
  "Bono",
  "Bono East",
  "North East",
  "Savannah",
  "Oti",
  "Western North",
];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export function CheckoutForm({
  stripeEnabled,
  moolreEnabled,
  shippingMethod,
  onShippingMethodChange,
  appliedCoupon,
  onCouponApplied,
  onCouponCleared,
}: {
  stripeEnabled: boolean;
  moolreEnabled: boolean;
  shippingMethod: ShippingMethod;
  onShippingMethodChange: (v: ShippingMethod) => void;
  appliedCoupon: string | null;
  onCouponApplied: (code: string, discountPesewas: number) => void;
  onCouponCleared: () => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hasHydrated);
  const clearCart = useCart((s) => s.clear);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    moolreEnabled ? "MOOLRE" : stripeEnabled ? "STRIPE" : "CASH_ON_DELIVERY"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultFirst = user?.name?.split(/\s+/)[0] ?? "";
  const defaultLast = user?.name?.split(/\s+/).slice(1).join(" ") ?? "";

  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch("/api/storefront/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          subtotal,
          shippingMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? "Invalid coupon");
        return;
      }
      onCouponApplied(data.code, data.discount);
      setCouponInput(data.code);
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "") || null;
    const email = String(formData.get("email") ?? "");
    const phone = String(formData.get("phone") ?? "");

    const useTiwaCheckout =
      paymentMethod === "MOOLRE" || paymentMethod === "MOBILE_MONEY";

    const payload = useTiwaCheckout
      ? {
          firstName,
          lastName: lastName ?? "",
          email,
          phone,
          address: String(formData.get("shippingLine1") ?? "") || "",
          city: String(formData.get("shippingCity") ?? "") || "",
          region: String(formData.get("shippingRegion") ?? "") || "",
          deliveryMethod: shippingMethod,
          items: items.map((i) => ({
            id: i.id,
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variantName: i.variantName ?? null,
            imageUrl: i.imageUrl ?? null,
          })),
        }
      : {
          firstName,
          lastName,
          email,
          phone,
          shippingMethod,
          shippingLine1: String(formData.get("shippingLine1") ?? "") || null,
          shippingLine2: String(formData.get("shippingLine2") ?? "") || null,
          shippingCity: String(formData.get("shippingCity") ?? "") || null,
          shippingRegion: String(formData.get("shippingRegion") ?? "") || null,
          shippingCountry:
            String(formData.get("shippingCountry") ?? "Ghana") || "Ghana",
          notes: String(formData.get("notes") ?? "") || null,
          couponCode: appliedCoupon,
          paymentMethod,
          items: items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId ?? null,
            variantName: i.variantName ?? null,
            productCode: i.productCode ?? null,
            variantSku: i.variantSku ?? null,
            slug: i.slug,
            name: i.name,
            price: i.price,
            currency: i.currency,
            imageUrl: i.imageUrl ?? null,
            quantity: i.quantity,
          })),
        };

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) {
            setErrors(data.fieldErrors);
            setFormError("Please correct the highlighted fields.");
          } else {
            setFormError(data?.error ?? "Something went wrong. Please try again.");
          }
          return;
        }

        if (paymentMethod !== "STRIPE" && paymentMethod !== "MOOLRE") {
          clearCart();
        }

        const url = data.redirectUrl ?? `/order-success?order=${data.orderNumber}`;
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      } catch (err) {
        console.error(err);
        setFormError("Could not reach the checkout service. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {formError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <i className="ri-error-warning-line mt-0.5 text-base" />
          <p>{formError}</p>
        </div>
      ) : null}

      {/* Contact — Tiwa split name */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <i className="ri-user-3-line text-primary-600" />
          Contact details
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll send your order confirmation here.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              First name *
            </label>
            <input
              name="firstName"
              type="text"
              placeholder="Akosua"
              defaultValue={defaultFirst}
              required
              className={inputClass}
            />
            {errors.firstName ? (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Last name
            </label>
            <input
              name="lastName"
              type="text"
              placeholder="Mensah"
              defaultValue={defaultLast}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Email *
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              defaultValue={user?.email ?? undefined}
              required
              className={inputClass}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Phone {paymentMethod === "MOOLRE" ? "*" : ""}
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="024 214 9489"
              required
              className={inputClass}
            />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Delivery method — Tiwa pickup / doorstep */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <i className="ri-truck-line text-primary-600" />
          Delivery method
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onShippingMethodChange("pickup")}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              shippingMethod === "pickup"
                ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <i
              className={`ri-store-2-line text-xl ${
                shippingMethod === "pickup" ? "text-primary-700" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Store pickup</p>
              <p className="text-xs text-gray-500">Collect at Palm Shades</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onShippingMethodChange("doorstep")}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              shippingMethod === "doorstep"
                ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <i
              className={`ri-truck-line text-xl ${
                shippingMethod === "doorstep" ? "text-primary-700" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Doorstep delivery</p>
              <p className="text-xs text-gray-500">We deliver to you</p>
            </div>
          </button>
        </div>

        {shippingMethod === "pickup" ? (
          <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50/60 p-4 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Pickup location</p>
            <p className="mt-1">{PICKUP_ADDRESS}</p>
            <input type="hidden" name="shippingCountry" value="Ghana" />
          </div>
        ) : (
          <div className="mt-4 space-y-3 rounded-lg border border-primary-100 bg-primary-50/40 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <i className="ri-map-pin-line text-primary-600" />
              Delivery address
            </p>
            <input
              name="shippingLine1"
              type="text"
              placeholder="Street address / landmark *"
              className={inputClass}
            />
            {errors.shippingLine1 ? (
              <p className="text-xs text-red-600">{errors.shippingLine1}</p>
            ) : null}
            <input
              name="shippingLine2"
              type="text"
              placeholder="Apartment / additional directions (optional)"
              className={inputClass}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="shippingCity"
                type="text"
                placeholder="City / town *"
                className={inputClass}
              />
              <select
                name="shippingRegion"
                defaultValue="Greater Accra"
                className={inputClass}
              >
                <option value="">Select region *</option>
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {(errors.shippingCity || errors.shippingRegion) && (
              <p className="text-xs text-red-600">
                {errors.shippingCity || errors.shippingRegion}
              </p>
            )}
            <input type="hidden" name="shippingCountry" value="Ghana" />
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
            Order notes (optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Special instructions for delivery or pickup"
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      {/* Coupon */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <i className="ri-coupon-2-line text-primary-600" />
          Coupon code
        </h2>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Enter code"
            disabled={!!appliedCoupon}
            className={`${inputClass} font-mono uppercase sm:flex-1`}
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={() => {
                onCouponCleared();
                setCouponInput("");
                setCouponError(null);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {couponLoading ? "Checking…" : "Apply"}
            </button>
          )}
        </div>
        {couponError ? (
          <p className="mt-2 text-xs text-red-600">{couponError}</p>
        ) : null}
        {appliedCoupon ? (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            <i className="ri-check-line mr-1" />
            Coupon {appliedCoupon} applied
          </p>
        ) : null}
        {errors.couponCode ? (
          <p className="mt-2 text-xs text-red-600">{errors.couponCode}</p>
        ) : null}
      </section>

      {/* Payment */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <i className="ri-bank-card-line text-primary-600" />
          Payment method
        </h2>
        <div className="mt-4">
          <PaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            stripeEnabled={stripeEnabled}
            moolreEnabled={moolreEnabled}
          />
        </div>
      </section>

      <div className="space-y-4 pb-24 lg:pb-0">
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={isPending || (hydrated && items.length === 0)}
            className="w-full"
          >
            {isPending ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                Processing…
              </>
            ) : paymentMethod === "MOOLRE" ? (
              <>
                <i className="ri-secure-payment-line" />
                Pay with Mobile Money
              </>
            ) : paymentMethod === "STRIPE" ? (
              <>
                <i className="ri-lock-line" />
                Pay securely with card
              </>
            ) : (
              <>
                Place order
                <i className="ri-arrow-right-line" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] text-gray-500">
          By placing your order you agree to our{" "}
          <Link href="/policies/terms" className="underline-offset-2 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/policies/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
