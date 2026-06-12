import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SmartImage } from "@/components/ui/SmartImage";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { HomeCategoryScroll } from "@/components/home/HomeCategoryScroll";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { homeCategoryTiles, homeSections } from "@/lib/data/homepage";
import { getCategoryImage } from "@/lib/media";

export function HomeCategoryStrip() {
  const { categories } = homeSections;

  return (
    <section className="border-y border-blush-200/80 bg-white py-12 md:py-16">
      <Container>
        <HomeSectionHeader
          eyebrow={categories.eyebrow}
          title={categories.title}
          ctaHref={categories.cta.href}
          ctaLabel={categories.cta.label}
          ctaStyle="link"
        />

        <HomeCategoryScroll>
          <ul className="flex gap-3 pb-1 sm:gap-4 md:gap-5">
            {homeCategoryTiles.map((tile) => (
              <li
                key={tile.slug}
                className="w-[min(72vw,220px)] shrink-0 sm:w-[200px]"
              >
                <Link
                  href={`/shop?category=${tile.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-blush-50 ring-1 ring-blush-200/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <SmartImage
                      src={getCategoryImage(tile.slug)}
                      alt={tile.name}
                      fallbackLabel={tile.name}
                      variant="gold"
                      className="object-[center_22%] transition-transform duration-500 ease-out group-hover:scale-105 sm:object-center"
                      sizes={IMAGE_SIZES.categoryCard}
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-charcoal backdrop-blur">
                      {tile.badge}
                    </span>
                  </div>
                  <p className="px-3 py-3 text-sm font-semibold text-charcoal sm:px-4 sm:py-3.5 sm:text-base">
                    {tile.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </HomeCategoryScroll>
      </Container>
    </section>
  );
}
