"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
        Palm Shades
      </p>
      <h1 className="mt-3 font-display text-3xl text-charcoal">
        We hit a snag
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
        This page could not load right now. Please try again — your cart and
        account are safe.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-charcoal-light/70">
          Ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-blush-200 px-6 py-2.5 text-sm font-semibold text-charcoal hover:bg-blush-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
