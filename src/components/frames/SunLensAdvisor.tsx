"use client";

import { Sun, Droplets, Wind } from "lucide-react";
import { accraSunContext } from "@/lib/data/frame-meta";
import { cn } from "@/lib/utils";

const seasonIcons = [Sun, Droplets, Wind] as const;

/** Accra-specific UV and lens guidance — unique to Palm Shades. */
export function SunLensAdvisor({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50/80 to-white ring-1 ring-blush-200/50",
        compact ? "p-4 sm:p-5" : "p-6 sm:p-8"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
          <Sun className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            Ghana Sun Lens Advisor
          </p>
          <p className="mt-1 font-display text-lg text-charcoal sm:text-xl">
            Built for {accraSunContext.city} light
          </p>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-light">
            Peak UV: {accraSunContext.uvIndexPeak}. {accraSunContext.tip}
          </p>
        </div>
      </div>

      <ul className={cn("mt-5 space-y-3", compact && "mt-4")}>
        {accraSunContext.seasons.map((s, i) => {
          const Icon = seasonIcons[i] ?? Sun;
          return (
            <li
              key={s.period}
              className="flex gap-3 rounded-xl bg-white/70 px-3 py-2.5 ring-1 ring-blush-200/60"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div>
                <p className="text-xs font-semibold text-charcoal">{s.period}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-charcoal-light">
                  {s.advice}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
