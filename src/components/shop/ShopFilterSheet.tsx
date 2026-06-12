"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { PriceFilter } from "@/components/shop/PriceFilter";
import { TagFilter } from "@/components/shop/TagFilter";
import { cn } from "@/lib/utils";

export function ShopFilterSheet({
  counts,
  hasFilters,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  counts: Record<string, number>;
  hasFilters: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (controlledOpen !== undefined) setInternalOpen(controlledOpen);
  }, [controlledOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {!hideTrigger ? (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors",
              hasFilters
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-blush-200 bg-white text-charcoal"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters ? (
              <span className="h-2 w-2 rounded-full bg-primary-600" aria-hidden />
            ) : null}
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-luxe transition-transform duration-300",
            open ? "translate-y-0" : "translate-y-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Shop filters"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blush-200/80 bg-white px-5 py-4">
            <h2 className="font-display text-xl text-charcoal">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-charcoal hover:bg-blush-50"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-8 px-5 py-6">
            <CategoryFilter counts={counts} />
            <PriceFilter />
            <TagFilter />
          </div>
        </div>
      </div>
    </>
  );
}
