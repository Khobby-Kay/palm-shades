"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CatalogProduct } from "@/lib/catalog";

export function HomeProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((p, i) => (
        <ScrollReveal key={p.id} delay={60 + (i % 4) * 70}>
          <ProductCard product={p} variant="compact" />
        </ScrollReveal>
      ))}
    </div>
  );
}
