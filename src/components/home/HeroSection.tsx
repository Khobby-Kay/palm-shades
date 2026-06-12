"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/image-sizes";
import { heroSlides } from "@/lib/media";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6500;
const TRANSITION_MS = 900;

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const total = heroSlides.length;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % total) + total) % total);
    },
    [total]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || total < 2) return;
    const id = window.setTimeout(next, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reducedMotion, next, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (
        !(
          root.contains(document.activeElement) ||
          document.activeElement === document.body
        )
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    if (startX == null || startY == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Palm Shades highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative isolate -mt-px w-full overflow-hidden bg-charcoal"
    >
      {/* Fixed aspect on wide screens keeps landscape photos framed; svh helps mobile browsers */}
      <div
        className={cn(
          "relative w-full",
          "h-[min(92svh,680px)] min-h-[420px]",
          "sm:h-[min(86svh,720px)] sm:min-h-[480px]",
          "lg:aspect-[2/1] lg:h-auto lg:max-h-[min(88vh,920px)] lg:min-h-[540px]"
        )}
      >
        {heroSlides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity ease-out",
                isActive ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
            >
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden transition-transform ease-out",
                  isActive ? "scale-100" : "scale-[1.03] lg:scale-[1.02]"
                )}
                style={{
                  transitionDuration: `${reducedMotion ? 0 : SLIDE_MS + TRANSITION_MS}ms`,
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  quality={IMAGE_QUALITY.hero}
                  sizes={IMAGE_SIZES.hero}
                  className={cn(
                    "object-cover",
                    slide.imageClassName ?? "object-center"
                  )}
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-charcoal/25 sm:bg-charcoal/20 lg:bg-charcoal/15" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-charcoal/75 via-charcoal/35 to-transparent sm:h-[58%] sm:from-charcoal/65 lg:h-[48%] lg:from-charcoal/60" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-charcoal/45 to-transparent sm:h-24 lg:h-20 lg:from-charcoal/25" />
            </div>
          );
        })}

        <div className="absolute inset-0 z-20 flex items-end sm:items-center">
          <div className="container mx-auto w-full px-4 pb-28 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-16 lg:pt-20">
            <SlideContent slide={heroSlides[active]} />
          </div>
        </div>

        <SlideDots
          active={active}
          total={total}
          paused={paused || reducedMotion}
          onSelect={goTo}
        />

        <p className="sr-only" aria-live="polite">
          Slide {active + 1} of {total}: {heroSlides[active].heading}{" "}
          {heroSlides[active].highlight}
        </p>
      </div>

    </section>
  );
}

function SlideContent({ slide }: { slide: (typeof heroSlides)[number] }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-white lg:max-w-4xl">
      {slide.eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 sm:mb-4 sm:text-xs">
          {slide.eyebrow}
        </p>
      ) : null}

      <h1 className="font-display text-[clamp(2rem,7vw,5.25rem)] leading-[0.98] tracking-[-0.02em] text-white">
        {slide.heading}{" "}
        <span className="italic text-primary-200">{slide.highlight}</span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:mt-5 sm:max-w-xl sm:text-base md:max-w-2xl">
        {slide.subhead}
      </p>

      <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <Link
          href={slide.primaryCta.href}
          prefetch
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/40 transition-all duration-200 hover:bg-primary-700 hover:shadow-primary-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:px-7 sm:py-3.5 sm:text-base"
        >
          {slide.primaryCta.label}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        {slide.secondaryCta ? (
          <Link
            href={slide.secondaryCta.href}
            prefetch
            className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:px-7 sm:py-3.5 sm:text-base"
          >
            {slide.secondaryCta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function SlideDots({
  active,
  total,
  paused,
  onSelect,
}: {
  active: number;
  total: number;
  paused: boolean;
  onSelect: (i: number) => void;
}) {
  if (total < 2) return null;

  return (
    <div className="absolute inset-x-0 bottom-[4.5rem] z-30 flex justify-center sm:bottom-7 lg:bottom-8">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(i)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <span
                className={cn(
                  "relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-300",
                  isActive ? "w-10" : "w-4 hover:bg-white/50"
                )}
              >
                {isActive ? (
                  <span
                    key={`fill-${i}-${paused ? "paused" : "play"}`}
                    className={cn(
                      "absolute inset-0 origin-left bg-white",
                      paused ? "scale-x-100" : "animate-hero-progress"
                    )}
                    style={{
                      animationDuration: `${SLIDE_MS}ms`,
                    }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
