"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Thin top bar — instant feedback while the next page loads. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setActive(false);
    setProgress(100);
    const done = setTimeout(() => setProgress(0), 200);
    return () => clearTimeout(done);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor?.href || anchor.target === "_blank" || anchor.download) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname && url.search === window.location.search) return;

      setActive(true);
      setProgress(12);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 8));
    }, 180);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  if (progress <= 0 && !active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary-600 shadow-[0_0_8px_rgba(219,39,119,0.45)] transition-[width] duration-200 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
