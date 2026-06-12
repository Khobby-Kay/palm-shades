"use client";

import { CreditCard, Smartphone, Landmark, Wallet, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types/enums";

interface Option {
  id: PaymentMethod;
  label: string;
  description: string;
  badge?: string;
  Icon: typeof CreditCard;
}

function buildOptions(moolreEnabled: boolean, stripeEnabled: boolean): Option[] {
  const opts: Option[] = [];

  if (moolreEnabled) {
    opts.push({
      id: "MOOLRE",
      label: "Mobile Money · MTN, Telecel & AT",
      description:
        "Pay on the secure payment page — approve on your phone or use your wallet",
      badge: "Recommended",
      Icon: Smartphone,
    });
  } else {
    opts.push({
      id: "MOBILE_MONEY",
      label: "Mobile Money",
      description: "MTN, Telecel or AirtelTigo — manual transfer instructions",
      Icon: Smartphone,
    });
  }

  if (stripeEnabled) {
    opts.push({
      id: "STRIPE",
      label: "Card · Visa / Mastercard",
      description: "Secure card payment processed via Stripe",
      Icon: CreditCard,
    });
  }

  opts.push(
    {
      id: "BANK_TRANSFER",
      label: "Bank Transfer",
      description: "Pay directly from your bank account",
      Icon: Landmark,
    },
    {
      id: "CASH_ON_DELIVERY",
      label: "Cash on Delivery",
      description: "Pay when your order arrives",
      Icon: Wallet,
    }
  );

  return opts;
}

export function PaymentMethodPicker({
  value,
  onChange,
  stripeEnabled,
  moolreEnabled,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
  stripeEnabled: boolean;
  moolreEnabled: boolean;
}) {
  const options = buildOptions(moolreEnabled, stripeEnabled);

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal-light">
        Payment method
      </legend>
      {options.map((opt) => {
        const disabled = opt.id === "STRIPE" && !stripeEnabled;
        const selected = value === opt.id;
        return (
          <label
            key={opt.id}
            className={cn(
              "group relative flex cursor-pointer items-start gap-4 rounded-3xl border bg-white p-5 transition-all",
              selected
                ? "border-primary-300 shadow-[0_18px_40px_-22px_rgba(190,24,93,0.5)] ring-1 ring-primary-300"
                : "border-blush-200 hover:border-primary-200",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={opt.id}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors",
                selected
                  ? "bg-primary-600 text-white"
                  : "bg-blush-50 text-primary-700 group-hover:bg-blush-100"
              )}
            >
              <opt.Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-charcoal">{opt.label}</p>
                {opt.badge && !disabled ? (
                  <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary-700">
                    {opt.badge}
                  </span>
                ) : null}
                {disabled ? (
                  <span className="rounded-full bg-charcoal/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-charcoal-light">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-charcoal-light">{opt.description}</p>
              {opt.id === "STRIPE" && !disabled ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-charcoal-light">
                  <Lock className="h-3 w-3" />
                  Secured by Stripe
                </p>
              ) : null}
              {opt.id === "MOOLRE" ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-charcoal-light">
                  <Lock className="h-3 w-3" />
                  Secure online payment
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                selected ? "border-primary-600 bg-primary-600" : "border-blush-200 bg-white"
              )}
            >
              {selected ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
