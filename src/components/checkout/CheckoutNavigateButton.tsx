"use client";

import { ArrowRight } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { useCart } from "@/store/cart";

/** Closes cart drawer and navigates to checkout — uses a real link so navigation works even if the client router fails. */
export function CheckoutNavigateButton({
  className,
  size = "lg",
  label = "Checkout",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hasHydrated);

  const ready = hydrated && items.length > 0;

  if (!ready) {
    return (
      <Button
        type="button"
        size={size}
        variant="primary"
        className={className}
        disabled
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <LinkButton
      href="/checkout"
      size={size}
      variant="primary"
      className={className}
      prefetch={false}
      onClick={() => close()}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </LinkButton>
  );
}
