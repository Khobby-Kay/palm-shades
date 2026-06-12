import Stripe from "stripe";

/**
 * Server-side Stripe client.
 *
 * Returns `null` when no STRIPE_SECRET_KEY is configured so callers can
 * gracefully fall back to manual payment methods (Mobile Money, Bank
 * Transfer, Cash on Delivery).
 */
function makeStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "" || key.startsWith("sk_test_xxx")) return null;
  return new Stripe(key, {
    // Pin a recent stable API version. `undefined` uses your account default.
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: {
      name: "Palm Shades",
      version: "0.1.0",
    },
  });
}

let cached: Stripe | null | undefined;
export function getStripe(): Stripe | null {
  if (cached === undefined) cached = makeStripe();
  return cached;
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}
