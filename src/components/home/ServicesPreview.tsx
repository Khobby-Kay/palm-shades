import Link from "next/link";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { services } from "@/lib/data/services";
import { getServiceImage } from "@/lib/media";
import { formatPrice } from "@/lib/utils";

export function ServicesPreview() {
  const featured = services.filter((s) => s.isFeatured).slice(0, 4);

  return (
    <section className="bg-charcoal py-14 md:py-24">
      <Container>
        <SectionBlockHeader
          title="Beauty services, expertly delivered"
          ctaHref="/services"
          ctaLabel="View all services"
          dark
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {featured.map((s, i) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group overflow-hidden rounded-2xl bg-charcoal-soft ring-1 ring-white/10 transition-transform active:scale-[0.98]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <SmartImage
                  src={getServiceImage(s.slug)}
                  alt={s.name}
                  fallbackLabel={s.name}
                  variant={i % 2 === 0 ? "rose" : "gold"}
                  className="transition-transform duration-500 group-hover:scale-105"
                  sizes={IMAGE_SIZES.serviceCard}
                  loading="lazy"
                />
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-blush-100/70 sm:text-[10px]">
                  <Clock className="h-3 w-3" />
                  {s.durationMin} min
                </div>
                <h3 className="mt-1 font-display text-base leading-tight text-white sm:text-lg">
                  {s.name}
                </h3>
                <p className="mt-1 text-xs text-primary-200 sm:text-sm">
                  From {formatPrice(s.price, { currency: s.currency })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
