"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { categories } from "@/lib/data/categories";
import {
  getVisitorProfile,
  recordDeclaredInterests,
} from "@/lib/personalization/profile";
import { useVisitorProfile } from "@/hooks/useVisitorProfile";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "motchis-interest-picker-dismissed";

export function InterestPicker() {
  const { hasSignals } = useVisitorProfile();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    setSelected(getVisitorProfile().declaredInterests);
  }, []);

  if (!mounted || dismissed || hasSignals) return null;

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const save = () => {
    if (selected.length) recordDeclaredInterests(selected);
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const skip = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="border-b border-blush-100 bg-gradient-to-r from-primary-50/80 via-white to-blush-50/80 lg:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-charcoal">
              What are you shopping for today?
            </p>
            <p className="text-xs text-charcoal-light">
              We&apos;ll suggest products we stock — including when you arrive from
              Google, Instagram, or shared links.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggle(c.slug)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected.includes(c.slug)
                  ? "border-primary-400 bg-primary-600 text-white"
                  : "border-blush-200 bg-white text-charcoal hover:border-primary-300"
              )}
            >
              {c.name}
            </button>
          ))}
          <button
            type="button"
            onClick={save}
            disabled={selected.length === 0}
            className="rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white disabled:opacity-40"
          >
            Show picks
          </button>
          <button
            type="button"
            onClick={skip}
            className="grid h-8 w-8 place-items-center rounded-full text-charcoal-light hover:bg-blush-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
