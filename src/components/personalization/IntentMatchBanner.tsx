"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { productsMatchingIntent } from "@/lib/personalization/score";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";
import { formatPrice } from "@/lib/utils";
import { getProductImage } from "@/lib/media";

export function IntentMatchBanner({
  products,
}: {
  products: CatalogProduct[];
}) {
  const { profile, hasSignals } = useVisitorProfile();

  const match = useMemo(
    () => productsMatchingIntent(products, profile, 3),
    [products, profile]
  );

  if (!hasSignals || match.products.length === 0 || match.terms.length === 0) {
    return null;
  }

  const label = match.terms[0];

  return (
    <div className="mb-6 rounded-2xl border border-primary-200/80 bg-primary-50/50 p-4 md:p-5">
      <p className="text-sm font-semibold text-primary-900">
        You were looking for &ldquo;{label}&rdquo; — we have these in the boutique
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {match.products.map((p) => {
          const img = p.imageUrl ?? getProductImage(p.slug);
          return (
            <li key={p.id}>
              <Link
                href={`/shop/${p.slug}`}
                className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-blush-200/80 transition-shadow hover:shadow-soft"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    className="h-12 w-12 rounded-lg bg-[#FAF7F2] object-contain p-1"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-[#FAF7F2]" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-charcoal">
                    {p.name}
                  </span>
                  <span className="text-xs text-charcoal-light">
                    {formatPrice(p.price, { currency: p.currency })}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
