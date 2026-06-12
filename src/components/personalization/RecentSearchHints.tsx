"use client";

import { useRouter, usePathname } from "next/navigation";
import { getTopSearchTerms } from "@/lib/personalization/profile";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";

export function RecentSearchHints() {
  const { hasSignals } = useVisitorProfile();
  const router = useRouter();
  const pathname = usePathname();

  if (!hasSignals || pathname !== "/shop") return null;

  const terms = getTopSearchTerms(5);
  if (terms.length === 0) return null;

  return (
    <div className="border-t border-blush-100 px-4 py-3 md:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal-light">
        Your recent searches
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {terms.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => router.replace(`/shop?q=${encodeURIComponent(term)}`)}
            className="rounded-full border border-blush-200 bg-blush-50/80 px-3 py-1 text-xs font-medium text-charcoal transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
