"use client";

import { ShieldCheck, Headphones, Truck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { homeTrustPillars } from "@/lib/data/homepage";

const icons = [ShieldCheck, Headphones, Truck];

export function HomeTrustGrid() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
      {homeTrustPillars.map((item, i) => {
        const Icon = icons[i] ?? ShieldCheck;
        return (
          <ScrollReveal key={item.title} delay={80 + i * 100}>
            <article className="h-full rounded-2xl border border-blush-200/80 bg-white p-6 text-center shadow-soft transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card sm:p-8">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700 transition-transform duration-300 ease-out group-hover:scale-105">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl text-charcoal">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                {item.body}
              </p>
            </article>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
