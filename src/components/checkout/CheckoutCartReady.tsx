"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCart } from "@/store/cart";
import { Container } from "@/components/ui/Container";

/**
 * Waits for persisted cart hydration before rendering checkout.
 * Avoids bouncing back to /cart while Zustand rehydrates.
 */
export function CheckoutCartReady({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hasHydrated);
  const cancelled = params.get("cancelled") === "1";

  useEffect(() => {
    if (!hydrated) return;
    if (cancelled) return;

    const timer = setTimeout(() => {
      const liveCount = useCart.getState().items.length;
      if (liveCount === 0) {
        router.replace("/cart");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hydrated, cancelled, router]);

  if (!hydrated) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
        <p className="mt-4 text-sm text-charcoal-light">Preparing checkout…</p>
      </Container>
    );
  }

  if (!cancelled && items.length === 0) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
        <p className="mt-4 text-sm text-charcoal-light">Taking you back to your cart…</p>
      </Container>
    );
  }

  return <>{children}</>;
}
