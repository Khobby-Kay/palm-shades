"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { homeSections } from "@/lib/data/homepage";

export function HomeShopCtaAnimated() {
  const { shopCta } = homeSections;

  return (
    <ScrollReveal offset={24}>
      <div className="overflow-hidden rounded-3xl bg-charcoal px-8 py-12 text-center text-white shadow-luxe transition-shadow duration-300 ease-out hover:shadow-luxe sm:px-12 sm:py-14 md:px-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-300">
          {shopCta.eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
          {shopCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-blush-100/80 sm:text-base">
          {shopCta.description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href={shopCta.primaryCta.href}
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-lg"
          >
            {shopCta.primaryCta.label}
          </Link>
          <Link
            href={shopCta.secondaryCta.href}
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-white/30 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
          >
            {shopCta.secondaryCta.label}
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
