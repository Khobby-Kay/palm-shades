import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { homeHero } from "@/lib/data/homepage";
import { brandImages } from "@/lib/media";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/image-sizes";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-blush-50">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gold-light/40 blur-3xl" />

      <Container className="relative py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
              {homeHero.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.08] tracking-tight text-charcoal">
              {homeHero.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-charcoal-light sm:text-base md:text-lg">
              {homeHero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={homeHero.primaryCta.href}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/40"
              >
                {homeHero.primaryCta.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={homeHero.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border-2 border-charcoal/15 bg-white px-7 py-3.5 text-sm font-semibold text-charcoal transition-colors hover:border-primary-300 hover:bg-white"
              >
                {homeHero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-luxe ring-1 ring-blush-200/80 sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={brandImages.heroStylistWig}
              alt="Palm Shades stylist at work in the boutique"
              fill
              priority
              quality={IMAGE_QUALITY.hero}
              sizes={IMAGE_SIZES.hero}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
          </div>
        </div>
      </Container>
    </section>
  );
}
