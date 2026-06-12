import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { CategoryItem } from "@/lib/data/categories";

export function ShopHero({
  activeCategory,
}: {
  activeCategory?: CategoryItem;
}) {
  const title = activeCategory?.name ?? "Shop All Eyewear";
  const description =
    activeCategory?.description ??
    "Curated sunglasses, optical frames, and accessories — hand-selected for fit, finish, and timeless appeal.";

  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-white">
      <div
        className="pointer-events-none absolute -right-[20%] top-0 z-0 h-full w-[75%] opacity-90 sm:-right-[10%] sm:w-[60%] lg:w-[50%]"
        aria-hidden
      >
        <svg
          viewBox="0 0 600 800"
          className="h-full w-full"
          preserveAspectRatio="xMaxYMid slice"
        >
          <path
            d="M120 0 C380 80 520 280 480 480 C440 680 280 800 0 800 L0 0 Z"
            fill="#C5A572"
            fillOpacity="0.18"
          />
          <path
            d="M200 40 C420 120 560 320 520 520 C480 720 320 760 80 760 L80 40 Z"
            fill="#1E3D34"
            fillOpacity="0.35"
          />
        </svg>
      </div>

      <Container className="relative z-10 py-12 md:py-20 lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm md:text-[11px]">
            See Luxury Clearly
          </span>

          <h1 className="mt-5 font-display text-[clamp(2.25rem,8vw,3.75rem)] leading-[1.02] tracking-[-0.02em] text-white">
            {title}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base md:leading-relaxed">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/shop?tag=new#shop-products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-charcoal shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-400"
            >
              New Arrivals
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-charcoal"
            >
              Book a Fitting
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
