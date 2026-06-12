"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TAGS = [
  { id: "new", label: "New Arrivals" },
  { id: "best-seller", label: "Best Sellers" },
  { id: "sale", label: "On Sale" },
];

export function TagFilter() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("tag");

  const buildHref = (value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete("tag");
    else next.set("tag", value);
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
        Collections
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref(null)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
            !active
              ? "border-primary-300 bg-primary-50 text-primary-700"
              : "border-blush-200 bg-white text-charcoal hover:border-primary-200"
          )}
        >
          All
        </Link>
        {TAGS.map((t) => (
          <Link
            key={t.id}
            href={buildHref(t.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              active === t.id
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-blush-200 bg-white text-charcoal hover:border-primary-200"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
