"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ExternalIntentCapture } from "@/components/personalization/ExternalIntentCapture";
import { PersonalizationSync as PersonalizationSyncImpl } from "@/components/personalization/PersonalizationSync";
import { InterestPicker as InterestPickerImpl } from "@/components/personalization/InterestPicker";

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

/** Renders public site header/footer except on /admin and auth routes. */
export function StorefrontChrome({
  children,
  announcement,
  navbar,
  footer,
  mobileNav,
  cart,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname === "/account/signin" ||
    pathname === "/account/signup" ||
    pathname === "/admin-signin";
  const isFocusedFlow =
    pathname === "/cart" ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/book");
  const isCheckoutOnly = pathname?.startsWith("/checkout");

  // Admin and auth pages render standalone — no storefront header/footer.
  if (isAdmin || isAuth) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <PersonalizationSync />
      <ExternalIntentCapture />
      <div className="sticky top-0 z-50 lg:fixed lg:inset-x-0 lg:top-0 lg:w-full">
        {announcement}
        {navbar}
      </div>
      <InterestPicker />
      <main
        id="main-content"
        className={
          isFocusedFlow
            ? "pb-0 lg:pt-[7.25rem]"
            : "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-[7.25rem]"
        }
      >
        {children}
      </main>
      {isCheckoutOnly ? null : footer}
      {isFocusedFlow ? null : mobileNav}
      {cart}
    </>
  );
}
