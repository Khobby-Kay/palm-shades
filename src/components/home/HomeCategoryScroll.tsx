"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

/** Horizontal scroll row with fade-up entrance. */
export function HomeCategoryScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <div className="mt-8 overflow-x-auto overscroll-x-contain px-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </ScrollReveal>
  );
}
