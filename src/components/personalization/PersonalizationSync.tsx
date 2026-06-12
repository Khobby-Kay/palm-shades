"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  syncCartProductIds,
  syncWishlistProductIds,
} from "@/lib/personalization/profile";
import {
  scheduleServerPersonalizationSync,
  syncPersonalizationOnLogin,
} from "@/lib/personalization/server-sync-client";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

/** Keeps visitor profile in sync with cart, wishlist, and Supabase when signed in. */
export function PersonalizationSync() {
  const cartItems = useCart((s) => s.items);
  const cartHydrated = useCart((s) => s.hasHydrated);
  const wishlistItems = useWishlist((s) => s.items);
  const wishHydrated = useWishlist((s) => s.hasHydrated);
  const { status } = useSession();
  const loginSyncDone = useRef(false);

  useEffect(() => {
    if (!wishHydrated) return;
    syncWishlistProductIds(wishlistItems.map((i) => i.id));
  }, [wishlistItems, wishHydrated]);

  useEffect(() => {
    if (!cartHydrated) return;
    const ids = [...new Set(cartItems.map((i) => i.productId))];
    syncCartProductIds(ids);
  }, [cartItems, cartHydrated]);

  const onLocalProfileChange = useCallback(() => {
    if (status === "authenticated") {
      scheduleServerPersonalizationSync();
    }
  }, [status]);

  useEffect(() => {
    window.addEventListener("motchis-personalization-updated", onLocalProfileChange);
    return () => {
      window.removeEventListener(
        "motchis-personalization-updated",
        onLocalProfileChange
      );
    };
  }, [onLocalProfileChange]);

  useEffect(() => {
    if (status !== "authenticated") {
      loginSyncDone.current = false;
      return;
    }
    if (loginSyncDone.current) return;
    loginSyncDone.current = true;
    void syncPersonalizationOnLogin();
  }, [status]);

  return null;
}
