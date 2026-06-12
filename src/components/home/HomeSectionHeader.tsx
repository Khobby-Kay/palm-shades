import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type HomeSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** Text link (SLI) vs filled button. */
  ctaStyle?: "link" | "button";
  align?: "left" | "center";
  className?: string;
};

/** Section title block — eyebrow + headline (+ optional body & CTA), SLI-style. */
export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
  ctaStyle = "button",
  align = "left",
  className,
}: HomeSectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered && "items-center text-center",
        !centered &&
          "sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-2 font-display text-2xl leading-tight text-charcoal sm:text-3xl md:text-4xl"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-charcoal-light sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {ctaHref && ctaLabel ? (
        centered || ctaStyle === "link" ? (
          <Link
            href={ctaHref}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors duration-300 ease-out hover:text-primary-800"
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <LinkButton href={ctaHref} variant="primary" size="md" className="shrink-0">
            {ctaLabel}
          </LinkButton>
        )
      ) : null}
    </div>
  );
}
