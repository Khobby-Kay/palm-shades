"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data/categories";

/** Horizontal category scroller — quick filter on mobile. */
export function ShopCategoryPills() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("category");

  const buildHref = (slug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (slug === null) next.delete("category");
    else next.set("category", slug);
    next.delete("page");
    const q = next.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  return (
    <div className="lg:hidden overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
      <div className="flex w-max gap-2 px-1">
        <Link
          href={buildHref(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
            !active
              ? "bg-charcoal text-white"
              : "bg-white text-charcoal ring-1 ring-blush-200"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={buildHref(c.slug)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
              active === c.slug
                ? "bg-primary-600 text-white"
                : "bg-white text-charcoal ring-1 ring-blush-200"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
