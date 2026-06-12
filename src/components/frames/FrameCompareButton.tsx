"use client";

import { GitCompare } from "lucide-react";
import { useFrameCompare, frameCompareSelectors } from "@/store/frame-compare";
import { cn } from "@/lib/utils";

export function FrameCompareButton({
  item,
  className,
  size = "md",
}: {
  item: {
    id: string;
    slug: string;
    name: string;
    price: number;
    currency: string;
    categorySlug: string;
    rating: number;
    imageUrl?: string;
  };
  className?: string;
  size?: "sm" | "md";
}) {
  const toggle = useFrameCompare((s) => s.toggle);
  const active = useFrameCompare((s) => s.has(item.id));
  const isFull = useFrameCompare(frameCompareSelectors.isFull);
  const hydrated = useFrameCompare((s) => s.hasHydrated);
  const disabled = hydrated && isFull && !active;

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      disabled={disabled}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      title={
        disabled
          ? "Compare tray full (max 3)"
          : active
            ? "Remove from compare"
            : "Compare frames"
      }
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-medium transition-all",
        size === "sm" ? "px-3 py-2 text-[10px] uppercase tracking-[0.16em]" : "px-4 py-2.5 text-xs uppercase tracking-[0.18em]",
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-blush-200 bg-white text-charcoal-light hover:border-primary-300 hover:text-charcoal",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <GitCompare className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {active ? "Comparing" : "Compare"}
    </button>
  );
}
