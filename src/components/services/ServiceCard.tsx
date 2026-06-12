import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getServiceImage } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import type { ServiceItem } from "@/lib/data/services";

export function ServiceCard({
  service,
  mode = "detail",
}: {
  service: ServiceItem;
  /** `book` links straight to the booking flow for this service. */
  mode?: "detail" | "book";
}) {
  const href =
    mode === "book"
      ? `/book?service=${service.slug}`
      : `/services/${service.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-blush-200/60 transition-all duration-500 active:scale-[0.98] sm:rounded-3xl lg:hover:-translate-y-1 lg:hover:shadow-luxe"
    >
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4]">
        <SmartImage
          src={getServiceImage(service.slug)}
          alt={service.name}
          fallbackLabel={service.name}
          variant="gold"
          className="object-[center_25%] transition-transform duration-700 group-hover:scale-105 sm:object-center"
          sizes={IMAGE_SIZES.serviceCard}
          loading="lazy"
        />
        {service.isFeatured ? (
          <span className="absolute left-5 top-5 rounded-full bg-charcoal px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
            Signature
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {service.durationMin} min
          </span>
          {service.ageRange ? (
            <>
              <span className="h-1 w-1 rounded-full bg-charcoal-light/50" />
              <span>Ages {service.ageRange}</span>
            </>
          ) : null}
        </div>
        <h3 className="font-display text-base text-charcoal sm:text-xl">{service.name}</h3>
        <p className="line-clamp-2 text-xs text-charcoal-light sm:text-sm">
          {service.shortDesc}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-blush-200/60 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-charcoal-light">
              From
            </p>
            <p className="font-display text-base text-charcoal sm:text-lg">
              {formatPrice(service.price, { currency: service.currency })}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-primary-200 bg-blush-50 text-primary-700 transition-all duration-500 group-hover:bg-primary-600 group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
