"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categories } from "@/lib/data/categories";
import { recordCategoryInterest, recordSearch } from "@/lib/personalization/profile";
import { RecentSearchHints } from "@/components/personalization/RecentSearchHints";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export function ShopControlBar({
  resultCount,
  activeCategorySlug,
  onOpenFilters,
  hasFilters,
}: {
  resultCount: number;
  activeCategorySlug?: string;
  onOpenFilters: () => void;
  hasFilters: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const initialQuery = params.get("q") ?? "";
  const sort = params.get("sort") ?? "featured";
  const category = params.get("category") ?? "";

  const [q, setQ] = useState(initialQuery);
  const [sortOpen, setSortOpen] = useState(false);

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== initialQuery) {
        if (q.trim().length >= 2) recordSearch(q);
        pushParams({ q: q || null });
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (category) recordCategoryInterest(category);
  }, [category]);

  useEffect(() => {
    const fromUrl = params.get("q")?.trim();
    if (fromUrl && fromUrl.length >= 2) recordSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSort = SORTS.find((s) => s.value === sort) ?? SORTS[0];
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <div className="overflow-hidden rounded-2xl border border-blush-200/80 bg-white shadow-soft md:rounded-3xl">
      {/* Row 1: Filter + Sort */}
      <div className="flex min-h-[48px] items-center justify-between gap-3 border-b border-blush-100 px-4 py-3 md:px-5">
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(
            "inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-charcoal transition-colors hover:text-primary-700",
            hasFilters && "text-primary-700"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {hasFilters ? (
            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" aria-hidden />
          ) : null}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-charcoal"
          >
            <span className="text-charcoal-light">Sort by</span>
            <span className="font-semibold">{currentSort.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-charcoal-light transition-transform",
                sortOpen && "rotate-180"
              )}
            />
          </button>
          {sortOpen ? (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-blush-200 bg-white shadow-luxe">
                {SORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      pushParams({
                        sort: s.value === "featured" ? null : s.value,
                      });
                      setSortOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2.5 text-left text-sm transition-colors",
                      s.value === sort
                        ? "bg-blush-50 font-medium text-primary-700"
                        : "text-charcoal hover:bg-blush-50/60"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Row 2: Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 overflow-x-auto border-b border-blush-100 px-4 py-2.5 text-xs text-charcoal-light scrollbar-none md:px-5"
      >
        <Link href="/" className="hover:text-primary-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/shop" className="hover:text-primary-700">
          Shop
        </Link>
        {activeCategory ? (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-medium text-charcoal">
              {activeCategory.name}
            </span>
          </>
        ) : (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="font-medium text-charcoal">All Products</span>
          </>
        )}
      </nav>

      {/* Row 3: Search + Category */}
      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-[1fr,auto] md:p-4">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-light" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-xl border border-blush-200 bg-blush-50/50 pl-10 pr-9 text-sm text-charcoal placeholder:text-charcoal-light/70 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300/25"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 grid h-9 w-9 min-h-[36px] min-w-[36px] -translate-y-1/2 place-items-center rounded-full text-charcoal-light hover:bg-blush-100 sm:h-11 sm:w-11 sm:min-h-[44px] sm:min-w-[44px]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>

        <div className="relative">
          <label htmlFor="shop-category" className="sr-only">
            Category
          </label>
          <select
            id="shop-category"
            value={category}
            onChange={(e) =>
              pushParams({ category: e.target.value || null })
            }
            className="h-11 w-full appearance-none rounded-xl border border-blush-200 bg-white pl-4 pr-10 text-sm font-medium text-charcoal focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/25 sm:min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-light" />
        </div>
      </div>

      <RecentSearchHints />

      <p className="border-t border-blush-100 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal-light md:px-5">
        {resultCount} {resultCount === 1 ? "product" : "products"}
      </p>
    </div>
  );
}
