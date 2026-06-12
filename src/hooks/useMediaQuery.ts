"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` breakpoint (1024px). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export type DevicePlatform = "ios" | "android" | "other";

export function useDeviceLayout() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [platform, setPlatform] = useState<DevicePlatform>("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform("ios");
    else if (/Android/i.test(ua)) setPlatform("android");
    else setPlatform("other");
  }, []);

  return {
    isMobile,
    isDesktop: !isMobile,
    platform,
  };
}
