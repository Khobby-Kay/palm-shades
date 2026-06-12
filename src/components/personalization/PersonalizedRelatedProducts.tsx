"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CatalogProduct } from "@/lib/catalog";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";

export function PersonalizedRelatedProducts({
  products,
  currentProductId,
  categorySlug,
}: {
  products: CatalogProduct[];
  currentProductId: string;
  categorySlug: string;
}) {
  const { hasSignals } = useVisitorProfile();
  const pool = products.filter((p) => p.id !== currentProductId);
  const related = usePersonalizedProducts(pool, {
    excludeIds: [currentProductId],
    limit: 4,
  });

  const display = hasSignals
    ? related
    : pool.filter((p) => p.categorySlug === categorySlug).slice(0, 4);

  if (display.length === 0) return null;

  const title = hasSignals ? "Recommended for you" : "From the same collection";
  const eyebrow = hasSignals ? "Your boutique picks" : "You might also love";

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Link
          href={`/shop?category=${categorySlug}`}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          See all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {display.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
