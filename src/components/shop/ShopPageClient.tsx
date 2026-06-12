"use client";

import { useMemo, useState } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { ShopControlBar } from "@/components/shop/ShopControlBar";
import { ShopFilterSheet } from "@/components/shop/ShopFilterSheet";
import { ShopGridCard } from "@/components/shop/ShopGridCard";
import { LinkButton } from "@/components/ui/Button";
import type { CatalogProduct } from "@/lib/catalog";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { cn } from "@/lib/utils";

export function ShopPageClient({
  products: serverPaged,
  filteredProducts,
  sortMode,
  pageSize,
  filteredCount,
  totalPages,
  currentPage,
  counts,
  hasFilters,
  activeCategorySlug,
  pageHrefs,
}: {
  products: CatalogProduct[];
  filteredProducts: CatalogProduct[];
  sortMode: string;
  pageSize: number;
  filteredCount: number;
  totalPages: number;
  currentPage: number;
  counts: Record<string, number>;
  hasFilters: boolean;
  activeCategorySlug?: string;
  pageHrefs: string[];
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const usePersonalizedSort = sortMode === "featured";

  const personalized = usePersonalizedProducts(filteredProducts, {
    enabled: usePersonalizedSort,
    limit: filteredProducts.length,
  });

  const displayProducts = useMemo(() => {
    if (!usePersonalizedSort) return serverPaged;
    const start = (currentPage - 1) * pageSize;
    return personalized.slice(start, start + pageSize);
  }, [
    usePersonalizedSort,
    serverPaged,
    personalized,
    currentPage,
    pageSize,
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <ShopControlBar
          resultCount={filteredCount}
          activeCategorySlug={activeCategorySlug}
          onOpenFilters={() => setFilterOpen(true)}
          hasFilters={hasFilters}
        />
      </Suspense>

      <ShopFilterSheet
        counts={counts}
        hasFilters={hasFilters}
        open={filterOpen}
        onOpenChange={setFilterOpen}
        hideTrigger
      />

      <div id="shop-products" className="mt-6 scroll-mt-28 md:mt-8">
        {displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blush-200 bg-white py-16 text-center">
            <h3 className="font-display text-2xl text-charcoal">
              No products found
            </h3>
            <p className="mt-2 max-w-sm px-6 text-sm text-charcoal-light">
              Try adjusting your filters or search term.
            </p>
            <LinkButton href="/shop" size="md" variant="primary" className="mt-6">
              View all products
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {displayProducts.map((p) => (
                <ShopGridCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav
                className="mt-12 flex max-w-full items-center justify-center gap-2 overflow-x-auto px-2 pb-1 scrollbar-none"
                aria-label="Pagination"
              >
                {pageHrefs.map((href, i) => {
                  const n = i + 1;
                  return (
                    <Link
                      key={n}
                      href={href}
                      aria-current={n === currentPage ? "page" : undefined}
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors",
                        n === currentPage
                          ? "bg-primary-600 text-white shadow-soft"
                          : "border border-blush-200 bg-white text-charcoal hover:border-primary-300 hover:text-primary-700"
                      )}
                    >
                      {n}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
