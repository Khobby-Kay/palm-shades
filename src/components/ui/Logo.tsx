import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { brandAssets } from "@/lib/brand-assets";
import { siteConfig } from "@/lib/site";

const sizes = {
  sm: { className: "h-8 sm:h-9", text: "text-lg", width: 130, height: 34 },
  md: { className: "h-9 sm:h-11", text: "text-xl md:text-2xl", width: 170, height: 44 },
  lg: { className: "h-12 sm:h-14", text: "text-2xl md:text-3xl", width: 220, height: 56 },
} as const;

export function Logo({
  className,
  tone = "dark",
  size = "md",
}: {
  className?: string;
  tone?: "dark" | "light";
  size?: keyof typeof sizes;
}) {
  const s = sizes[size];
  const src = tone === "light" ? brandAssets.logoLight : brandAssets.logo;

  if (brandAssets.logoType === "text") {
    return (
      <Link
        href="/"
        className={cn("group inline-flex shrink-0 flex-col leading-none", className)}
        aria-label={`${siteConfig.name} — home`}
      >
        <span
          className={cn(
            "font-display tracking-[0.08em] transition-colors",
            tone === "light" ? "text-white group-hover:text-primary-200" : "text-charcoal group-hover:text-primary-800",
            s.text
          )}
        >
          Palm{" "}
          <span className={cn("italic", tone === "light" ? "text-primary-300" : "text-primary-700")}>
            Shades
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 hidden text-[9px] uppercase tracking-[0.28em] sm:block",
            tone === "light" ? "text-blush-100/70" : "text-charcoal-light"
          )}
        >
          Luxury Eyewear
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn("group inline-flex shrink-0 items-center", className)}
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src={src}
        alt={brandAssets.logoAlt}
        width={s.width}
        height={s.height}
        priority={size === "md"}
        className={cn(
          s.className,
          "w-auto max-w-[200px] object-contain object-left transition-opacity duration-200 group-hover:opacity-90 md:max-w-[240px]"
        )}
      />
    </Link>
  );
}
