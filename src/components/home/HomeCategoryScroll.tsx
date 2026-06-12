"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

/** Horizontal scroll row with fade-up entrance. */
export function HomeCategoryScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <div className="-mx-4 mt-8 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6">
        {children}
      </div>
    </ScrollReveal>
  );
}
