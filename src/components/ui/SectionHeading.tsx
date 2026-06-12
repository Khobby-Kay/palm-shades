import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-blush-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-700">
          <span className="h-1 w-1 rounded-full bg-primary-500" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 font-display text-display-md text-charcoal">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-charcoal-light md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
