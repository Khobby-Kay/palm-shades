"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { siteConfig } from "@/lib/site";

/** Warm key routes — staggered so we never burst the DB connection pool. */
const EXTRA_ROUTES = [
  "/cart",
  "/checkout",
  "/wishlist",
  "/faq",
  "/account",
  "/account/signin",
] as const;

const PREFETCH_GAP_MS = 150;
const START_DELAY_MS = 2000;

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetching during dev HMR loads stale webpack chunks → runtime "reading 'call'".
    if (process.env.NODE_ENV === "development") return;

    const routes = [
      ...siteConfig.nav.map((item) => item.href),
      ...EXTRA_ROUTES,
    ];

    let cancelled = false;

    const warm = async () => {
      for (const href of routes) {
        if (cancelled) return;
        router.prefetch(href);
        await new Promise((r) => setTimeout(r, PREFETCH_GAP_MS));
      }
    };

    const timer = setTimeout(() => {
      void warm();
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}
