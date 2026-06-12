"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { shouldReduceBackgroundSync } from "@/lib/client-device";

const POLL_MS = 12000;
const CONNECT_DELAY_MS = 3500;
const REFRESH_DEBOUNCE_MS = 2000;

function shouldRefreshPath(pathname: string) {
  if (!pathname) return false;
  if (pathname === "/admin/login") return false;
  return pathname.startsWith("/admin");
}

export function LiveActivitySync() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const lastVersionRef = useRef<number | null>(null);
  const pollIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!shouldRefreshPath(pathname)) return;

    // Mobile: skip background polling/SSE — it competes with page loads for the single DB connection.
    if (shouldReduceBackgroundSync()) return;

    const pollMs = POLL_MS;
    const connectDelayMs = CONNECT_DELAY_MS;

    let active = true;
    let es: EventSource | null = null;

    function applyVersion(version: number) {
      const prev = lastVersionRef.current;
      if (prev === null) {
        lastVersionRef.current = version;
        return;
      }
      if (version > prev) {
        lastVersionRef.current = version;
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
          router.refresh();
        }, REFRESH_DEBOUNCE_MS);
        return;
      }
      lastVersionRef.current = version;
    }

    async function pollOnce() {
      try {
        const res = await fetch("/api/activity/version", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { version?: number };
        if (typeof data.version === "number") applyVersion(data.version);
      } catch {
        // Ignore transient polling errors.
      }
    }

    function startPollingFallback() {
      if (pollIdRef.current) return;
      void pollOnce();
      pollIdRef.current = setInterval(pollOnce, pollMs);
    }

    function stopPollingFallback() {
      if (pollIdRef.current) {
        clearInterval(pollIdRef.current);
        pollIdRef.current = null;
      }
    }

    function connectSse() {
      if (!active || typeof EventSource === "undefined") {
        startPollingFallback();
        return;
      }

      try {
        es = new EventSource("/api/activity/stream");
      } catch {
        startPollingFallback();
        return;
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { version?: number };
          if (typeof data.version === "number") applyVersion(data.version);
        } catch {
          // Ignore malformed events.
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!active) return;
        startPollingFallback();
        // Retry SSE after a short backoff.
        setTimeout(() => {
          if (active) connectSse();
        }, 10000);
      };

      es.onopen = () => {
        stopPollingFallback();
      };
    }

    const connectTimer = setTimeout(connectSse, connectDelayMs);

    return () => {
      active = false;
      clearTimeout(connectTimer);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      es?.close();
      stopPollingFallback();
    };
  }, [router, pathname]);

  return null;
}
