"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/**
 * Tiny client helper that clears the cart store as soon as the user lands
 * on a successful order page (after Stripe redirect, etc.). Safe to mount
 * multiple times — `clear()` is idempotent.
 */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  const hydrated = useCart((s) => s.hasHydrated);

  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);

  return null;
}
