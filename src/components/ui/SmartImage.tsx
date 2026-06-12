"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { IMAGE_QUALITY } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";

type Variant = "rose" | "blush" | "ivory" | "gold" | "charcoal";

interface SmartImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt: string;
  variant?: Variant;
  fallbackLabel?: string;
  containerClassName?: string;
  /** cover = crop to fill (heroes). contain = show full image (products). */
  fit?: "cover" | "contain";
  /** LCP / hero — eager load, high fetch priority */
  priority?: boolean;
  /** Skip opacity fade (above-the-fold) */
  instant?: boolean;
  quality?: number;
}

export function SmartImage({
  src,
  alt,
  variant = "gold",
  fallbackLabel,
  containerClassName,
  className,
  fit = "cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false,
  instant = false,
  quality,
  loading,
  fetchPriority,
  ...rest
}: SmartImageProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = !!src && !errored;
  const showLoaded = showImage && (instant || priority || loaded);

  const resolvedQuality =
    quality ?? (fit === "contain" ? IMAGE_QUALITY.product : IMAGE_QUALITY.default);
  const resolvedLoading = loading ?? (priority ? undefined : "lazy");
  const resolvedFetchPriority =
    fetchPriority ?? (priority ? "high" : "low");

  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      {!showLoaded ? (
        <Placeholder
          variant={variant}
          label={fallbackLabel}
          className="absolute inset-0 z-0 h-full w-full"
        />
      ) : null}

      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          quality={resolvedQuality}
          priority={priority}
          loading={resolvedLoading}
          fetchPriority={resolvedFetchPriority}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            fit === "contain" ? "object-contain object-center" : "object-cover",
            !instant && !priority && "transition-opacity duration-150",
            showLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      ) : null}
    </div>
  );
}
