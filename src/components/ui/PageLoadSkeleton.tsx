export function PageLoadSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6 px-5 py-12 sm:px-6 lg:px-8" aria-hidden>
      <div className="mx-auto h-8 max-w-md rounded-full bg-blush-100" />
      <div className="mx-auto h-4 max-w-lg rounded-full bg-blush-50" />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 pt-4 md:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-3xl bg-blush-100/80" />
        ))}
      </div>
    </div>
  );
}
