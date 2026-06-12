"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safe = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[88px,1fr]">
      <div className="order-2 flex gap-2.5 overflow-x-auto pb-1 sm:gap-3 lg:order-1 lg:max-h-[min(640px,70vh)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {safe.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] p-1.5 ring-1 transition-all sm:h-20 sm:w-20 sm:rounded-2xl sm:p-2",
              active === i
                ? "ring-2 ring-primary-500"
                : "ring-blush-200 hover:ring-primary-200"
            )}
          >
            <SmartImage
              src={img}
              alt={`${alt} ${i + 1}`}
              variant="ivory"
              fit="contain"
              sizes={IMAGE_SIZES.productThumb}
              quality={76}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="order-1 relative aspect-square overflow-hidden rounded-2xl bg-[#FAF7F2] ring-1 ring-blush-200/60 sm:rounded-[2rem] lg:order-2">
        <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10">
          <SmartImage
            src={safe[active]}
            alt={alt}
            variant="ivory"
            fit="contain"
            priority
            sizes={IMAGE_SIZES.productDetail}
          />
        </div>
      </div>
    </div>
  );
}
