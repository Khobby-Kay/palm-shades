/**
 * Storefront chrome visibility — top navbar on all standard customer pages.
 * Standalone routes render without any public header/footer (admin, sign-in).
 */

export function isStandaloneRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname === "/account/signin" ||
    pathname === "/account/signup" ||
    pathname === "/admin-signin"
  );
}

/** Checkout only — keep top navbar; hide footer and mobile tab bar. */
export function isCheckoutFlow(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/checkout");
}

export function shouldShowMobileBottomNav(pathname: string | null): boolean {
  if (!pathname || isStandaloneRoute(pathname) || isCheckoutFlow(pathname)) {
    return false;
  }
  return true;
}

export function shouldShowFooter(pathname: string | null): boolean {
  if (!pathname || isStandaloneRoute(pathname) || isCheckoutFlow(pathname)) {
    return false;
  }
  return true;
}
