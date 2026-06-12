"use client";

import { useEffect } from "react";
import { ensureFreshBuild } from "@/lib/pwa-cache";

async function clearLegacyWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const regs = await navigator.serviceWorker.getRegistrations();
  for (const reg of regs) {
    const script = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? "";
    if (script.includes("/service-worker.js")) {
      await reg.unregister();
    }
  }
}

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      await clearLegacyWorkers();

      if (process.env.NODE_ENV === "development") {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        return;
      }

      if (await ensureFreshBuild()) return;

      // Drop any stale SW before registering the current build.
      const existing = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        existing
          .filter((r) => (r.active?.scriptURL ?? "").includes("/sw.js"))
          .map((r) => r.unregister())
      );

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          void reg.update();
        })
        .catch(() => {
          /* non-fatal */
        });
    })();
  }, []);

  return null;
}
