"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ExternalIntentCapture } from "@/components/personalization/ExternalIntentCapture";
import { PersonalizationSync as PersonalizationSyncImpl } from "@/components/personalization/PersonalizationSync";
import { InterestPicker as InterestPickerImpl } from "@/components/personalization/InterestPicker";
import {
  isStandaloneRoute,
  shouldShowFooter,
  shouldShowMobileBottomNav,
} from "@/lib/storefront-chrome";

const isDev = process.env.NODE_ENV === "development";

const PersonalizationSync = isDev
  ? PersonalizationSyncImpl
  : dynamic(
      () =>
        import("@/components/personalization/PersonalizationSync").then(
          (m) => m.PersonalizationSync
        ),
      { ssr: false }
    );

const InterestPicker = isDev
  ? InterestPickerImpl
  : dynamic(
      () =>
        import("@/components/personalization/InterestPicker").then(
          (m) => m.InterestPicker
        ),
      { ssr: false }
    );

type StorefrontChromeProps = {
  children: ReactNode;
  announcement: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  mobileNav: ReactNode;
  cart: ReactNode;
};

/** Public site shell — navbar on every standard page; admin/auth stay standalone. */
export function StorefrontChrome({
  children,
  announcement,
  navbar,
  footer,
  mobileNav,
  cart,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const showMobileNav = shouldShowMobileBottomNav(pathname);
  const showFooter = shouldShowFooter(pathname);

  if (isStandaloneRoute(pathname)) {
    return <div className="min-h-[100dvh]">{children}</div>;
  }

  return (
    <div className="site-shell relative min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <PersonalizationSync />
      <ExternalIntentCapture />
      <div className="sticky top-0 z-50 w-full lg:fixed lg:inset-x-0 lg:top-0">
        {announcement}
        {navbar}
      </div>
      <InterestPicker />
      <main
        id="main-content"
        className={
          showMobileNav
            ? "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-[7.25rem]"
            : "pb-[env(safe-area-inset-bottom)] lg:pb-0 lg:pt-[7.25rem]"
        }
      >
        {children}
      </main>
      {showFooter ? footer : null}
      {showMobileNav ? mobileNav : null}
      {cart}
    </div>
  );
}
