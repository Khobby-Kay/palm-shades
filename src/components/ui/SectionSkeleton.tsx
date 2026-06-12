import { cn } from "@/lib/utils";

export function SectionSkeleton({
  className,
  rows = 2,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn("animate-pulse px-5 py-14 sm:px-6 lg:px-8", className)}
      aria-hidden
    >
      <div className="mx-auto h-8 max-w-xs rounded-full bg-blush-100" />
      <div className="mx-auto mt-3 h-4 max-w-sm rounded-full bg-blush-50" />
      <div
        className={cn(
          "mx-auto mt-10 grid max-w-6xl gap-4",
          rows === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {Array.from({ length: rows === 3 ? 6 : 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-3xl bg-blush-100/90",
              rows === 3 ? "aspect-[4/3]" : "aspect-[4/5] sm:aspect-[5/4]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
