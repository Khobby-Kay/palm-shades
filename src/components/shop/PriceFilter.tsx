"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PRICE_RANGES = [
  { id: "0-100", label: "Under GHS 100", min: 0, max: 10000 },
  { id: "100-200", label: "GHS 100 – 200", min: 10000, max: 20000 },
  { id: "200-300", label: "GHS 200 – 300", min: 20000, max: 30000 },
  { id: "300+", label: "GHS 300+", min: 30000, max: Infinity },
];

export function PriceFilter() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("price");

  const buildHref = (value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete("price");
    else next.set("price", value);
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
        Price
      </p>
      <ul className="flex flex-col gap-1.5">
        <li>
          <Link
            href={buildHref(null)}
            className={cn(
              "block rounded-2xl px-4 py-2.5 text-sm transition-colors",
              !active
                ? "bg-blush-50 font-medium text-primary-700"
                : "text-charcoal hover:bg-blush-50/60"
            )}
          >
            Any price
          </Link>
        </li>
        {PRICE_RANGES.map((r) => (
          <li key={r.id}>
            <Link
              href={buildHref(r.id)}
              className={cn(
                "block rounded-2xl px-4 py-2.5 text-sm transition-colors",
                active === r.id
                  ? "bg-blush-50 font-medium text-primary-700"
                  : "text-charcoal hover:bg-blush-50/60"
              )}
            >
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PRICE_RANGES };
