/** True on phones/tablets — matches Tailwind `lg` breakpoint. */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

/** True on touch-first devices (most phones). */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Mobile browsers keep fewer connections and drop SSE more often.
 * Skip heavy background sync (live admin refresh, route prefetch burst).
 */
export function shouldReduceBackgroundSync(): boolean {
  return isMobileViewport() || isCoarsePointer();
}
