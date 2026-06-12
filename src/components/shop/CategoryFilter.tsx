"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data/categories";

export function CategoryFilter({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("category");

  const buildHref = (categorySlug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (categorySlug === null) next.delete("category");
    else next.set("category", categorySlug);
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
        Categories
      </p>
      <ul className="flex flex-col gap-1.5">
        <li>
          <Link
            href={buildHref(null)}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm transition-colors",
              !active
                ? "bg-blush-50 font-medium text-primary-700"
                : "text-charcoal hover:bg-blush-50/60"
            )}
          >
            <span>All Products</span>
            <span className="text-xs text-charcoal-light">{total}</span>
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={buildHref(c.slug)}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm transition-colors",
                active === c.slug
                  ? "bg-blush-50 font-medium text-primary-700"
                  : "text-charcoal hover:bg-blush-50/60"
              )}
            >
              <span>{c.name}</span>
              <span className="text-xs text-charcoal-light">
                {counts[c.slug] ?? 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
