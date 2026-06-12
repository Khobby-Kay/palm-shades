import { cn } from "@/lib/utils";

/** Elegant gold/ivory gradient placeholder used until custom photography is supplied. */
export function Placeholder({
  label,
  className,
  variant = "gold",
}: {
  label?: string;
  className?: string;
  variant?: "rose" | "blush" | "ivory" | "gold" | "charcoal";
}) {
  const variants: Record<NonNullable<typeof variant>, string> = {
    rose: "from-[#f5e7c8] via-[#fffaf0] to-[#e8d5b5] text-gold-dark",
    blush: "from-[#fffaf3] via-white to-[#f5efe6] text-primary-600",
    ivory: "from-[#fffaf3] via-white to-[#f6ead8] text-gold-dark",
    gold: "from-[#f5e7c8] via-[#fffaf0] to-[#e1c79a] text-gold-dark",
    charcoal: "from-[#1E3D34] via-[#141414] to-[#2C5548] text-primary-200",
  };

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-gradient-to-br",
        variants[variant],
        className
      )}
      aria-hidden={!label}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
        <div className="absolute -top-20 -left-12 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_55%)]" />
      {label ? (
        <div className="relative flex h-full w-full items-end justify-start p-6">
          <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur">
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
