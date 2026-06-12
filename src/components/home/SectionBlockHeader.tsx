import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Minimal section header: one headline + optional CTA button (no extra copy). */
export function SectionBlockHeader({
  title,
  ctaHref,
  ctaLabel,
  titleClassName,
  dark,
}: {
  title: string;
  ctaHref?: string;
  ctaLabel?: string;
  titleClassName?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <h2
        className={cn(
          "font-display text-2xl leading-tight sm:text-display-md",
          dark ? "text-white" : "text-charcoal",
          titleClassName
        )}
      >
        {title}
      </h2>
      {ctaHref && ctaLabel ? (
        <LinkButton
          href={ctaHref}
          variant={dark ? "primary" : "primary"}
          size="md"
          className={dark ? "shrink-0" : "shrink-0"}
        >
          {ctaLabel}
        </LinkButton>
      ) : null}
    </div>
  );
}
