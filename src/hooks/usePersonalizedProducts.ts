"use client";

import { useMemo } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { rankProductsByInterest } from "@/lib/personalization/score";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";

export function usePersonalizedProducts(
  products: CatalogProduct[],
  options?: { excludeIds?: string[]; limit?: number; enabled?: boolean }
) {
  const { profile, hasSignals } = useVisitorProfile();
  const enabled = options?.enabled !== false;

  return useMemo(() => {
    if (!enabled || !hasSignals) {
      return products.slice(0, options?.limit ?? products.length);
    }
    return rankProductsByInterest(products, profile, {
      excludeIds: options?.excludeIds,
      limit: options?.limit,
    });
  }, [products, profile, hasSignals, enabled, options?.excludeIds, options?.limit]);
}
