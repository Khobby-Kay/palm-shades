/**
 * Order pricing & numbering helpers — kept pure so they can be used on the
 * server, in tests, and on the client (for live cart preview).
 */

import type { CartItemInput } from "@/lib/validators/checkout";

/** Free shipping kicks in at this subtotal (in minor units / pesewas). */
export const FREE_SHIPPING_THRESHOLD = 50000; // GHS 500
/** Flat shipping fee below the threshold (minor units). */
export const FLAT_SHIPPING_FEE = 3000; // GHS 30

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

export function calculateTotals(
  items: Array<Pick<CartItemInput, "price" | "quantity" | "currency">>,
  opts: {
    discount?: number;
    shippingMethod?: "pickup" | "doorstep";
  } = {}
): OrderTotals {
  const currency = items[0]?.currency ?? "GHS";
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    opts.shippingMethod === "pickup"
      ? 0
      : subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING_FEE;
  const discount = Math.max(0, opts.discount ?? 0);
  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total, currency };
}

/** Tiwa-compatible order reference (used by Moolre callback/verify). */
export function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function paymentMethodLabel(method: string): string {
  switch (method) {
    case "STRIPE":
      return "Card (Visa / Mastercard)";
    case "MOOLRE":
      return "Mobile Money";
    case "MOBILE_MONEY":
      return "Mobile Money (manual)";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "CASH_ON_DELIVERY":
      return "Cash on Delivery";
    default:
      return method;
  }
}
