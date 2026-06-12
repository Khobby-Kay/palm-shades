"use client";

import { IntentMatchBanner } from "@/components/personalization/IntentMatchBanner";
import type { CatalogProduct } from "@/lib/catalog";

export function ShopIntentBanner({ products }: { products: CatalogProduct[] }) {
  return <IntentMatchBanner products={products} />;
}
