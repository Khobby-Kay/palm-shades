"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";
import { personalizationHeadline } from "@/lib/personalization/score";

export function PickedForYouSection({
  products,
}: {
  products: CatalogProduct[];
}) {
  const { hasSignals, profile } = useVisitorProfile();
  const picked = usePersonalizedProducts(products, { limit: 8 });
  const subtitle = hasSignals
    ? personalizationHeadline(profile) ?? "Curated from your recent browsing"
    : null;

  if (!hasSignals) return null;

  const display = picked.slice(0, 4);
  if (display.length === 0) return null;

  return (
    <section className="relative border-y border-blush-100 bg-gradient-to-b from-primary-50/40 to-white py-14 md:py-20">
      <Container>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Picked for you
            </p>
            {subtitle ? (
              <p className="mt-1 max-w-lg text-sm text-charcoal-light">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            See more in the boutique →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {display.map((p) => (
            <ProductCard key={p.id} product={p} variant="compact" />
          ))}
        </div>
      </Container>
    </section>
  );
}
