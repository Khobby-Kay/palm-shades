import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { categories } from "@/lib/data/categories";
import { getCategoryImage } from "@/lib/media";

export function FeaturedCategories() {
  const preview = categories.slice(0, 4);

  return (
    <section className="py-14 md:py-24">
      <Container>
        <SectionBlockHeader
          title="Shop by category"
          ctaHref="/shop"
          ctaLabel="See everything"
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {preview.map((c, i) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-blush-200/60 transition-all duration-500 active:scale-[0.98] sm:rounded-3xl lg:hover:-translate-y-1 lg:hover:shadow-luxe"
            >
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4]">
                <SmartImage
                  src={getCategoryImage(c.slug)}
                  alt={c.name}
                  fallbackLabel={c.name}
                  variant={c.accent === "gold" ? "gold" : c.accent === "ivory" ? "ivory" : c.accent === "blush" ? "blush" : "rose"}
                  className="transition-transform duration-700 group-hover:scale-105"
                  sizes={IMAGE_SIZES.categoryCard}
                  loading="lazy"
                />
                <span className="absolute left-5 top-5 z-10 rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-charcoal backdrop-blur">
                  0{i + 1}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-3 sm:gap-4 sm:p-6">
                <div>
                  <h3 className="font-display text-base text-charcoal sm:text-xl">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-charcoal-light sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary-200 bg-blush-50 text-primary-700 transition-all duration-500 sm:h-10 sm:w-10 lg:group-hover:bg-primary-600 lg:group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
