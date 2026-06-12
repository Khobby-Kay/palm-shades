import { Container } from "@/components/ui/Container";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";
import { isMoolreConfigured } from "@/lib/moolre";
import { isStripeConfigured } from "@/lib/stripe";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Checkout — Secure Payment",
  description: "Complete your Palm Shades order securely.",
  path: "/checkout",
});

export default function CheckoutPage() {
  const moolreEnabled = isMoolreConfigured();
  const stripeEnabled = isStripeConfigured();

  return (
    <div className="min-h-screen bg-blush-50/80 pb-24">
      <div className="border-b border-blush-200/80 bg-white">
        <Container className="py-8 md:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            Secure checkout
          </p>
          <h1 className="mt-2 font-display text-3xl text-charcoal md:text-4xl">
            Complete your order
          </h1>
          <p className="mt-2 max-w-xl text-sm text-charcoal-light">
            Enter your details, choose delivery, and pay with Mobile Money or card.
          </p>
        </Container>
      </div>

      <Container>
        <CheckoutPageClient
          stripeEnabled={stripeEnabled}
          moolreEnabled={moolreEnabled}
        />
      </Container>
    </div>
  );
}
