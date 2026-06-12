"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useFrameCompare, frameCompareSelectors } from "@/store/frame-compare";
import { cn } from "@/lib/utils";

export function FrameCompareBar() {
  const items = useFrameCompare((s) => s.items);
  const remove = useFrameCompare((s) => s.remove);
  const clear = useFrameCompare((s) => s.clear);
  const count = useFrameCompare(frameCompareSelectors.count);
  const hydrated = useFrameCompare((s) => s.hasHydrated);

  if (!hydrated || count === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-[45] border-t border-blush-200/80 bg-white/95 shadow-luxe backdrop-blur-md",
        "inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md lg:rounded-2xl lg:border lg:shadow-card"
      )}
      role="region"
      aria-label="Frame compare tray"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 lg:max-w-none">
        <GitCompare className="hidden h-4 w-4 shrink-0 text-primary-600 sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex shrink-0 items-center gap-2 rounded-xl bg-blush-50/80 py-1 pl-1 pr-2 ring-1 ring-blush-200/60"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#FAF7F2] p-0.5">
                <SmartImage
                  src={item.imageUrl}
                  alt=""
                  fit="contain"
                  sizes="40px"
                  variant="ivory"
                />
              </div>
              <span className="max-w-[5.5rem] truncate text-[10px] font-medium text-charcoal sm:max-w-[7rem] sm:text-xs">
                {item.name.split(" — ")[0]}
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="grid h-6 w-6 place-items-center rounded-full text-charcoal-light hover:bg-white hover:text-charcoal"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <Link
          href="/compare"
          className="shrink-0 rounded-full bg-charcoal px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-charcoal-soft sm:px-4 sm:text-xs"
        >
          Compare ({count})
        </Link>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 text-[10px] uppercase tracking-wider text-charcoal-light hover:text-charcoal"
          aria-label="Clear compare tray"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
