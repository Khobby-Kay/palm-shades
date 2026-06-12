import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK = "/images/palm-shades-logo.png";

type CoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  objectFit?: "cover" | "contain";
  sizes?: string;
};

/** Fills a `relative` parent. Uses unoptimized for dynamic admin/catalog URLs. */
export function CoverImage({
  src,
  alt,
  className,
  objectFit = "cover",
  sizes = "96px",
}: CoverImageProps) {
  return (
    <Image
      src={src?.trim() || FALLBACK}
      alt={alt}
      fill
      sizes={sizes}
      className={cn(
        objectFit === "contain" ? "object-contain" : "object-cover",
        className
      )}
      unoptimized
    />
  );
}
