"use client";

import { useEffect, useState } from "react";
import { purgePwaState } from "@/lib/pwa-cache";

const RELOAD_KEY = "motchis-global-error-reload";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        await purgePwaState();
      } catch {
        /* non-fatal */
      }

      try {
        if (!sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* private mode */
      }

      console.error("[global error]", error.digest ?? error.message);
      setRecovering(false);
    })();
  }, [error]);

  if (recovering) {
    return (
      <html lang="en-GH">
        <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-slate-600">Refreshing Palm Shades…</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en-GH">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            Palm Shades
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The page could not load. This is usually temporary — try again in a
            moment.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-slate-400">
              Ref: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
