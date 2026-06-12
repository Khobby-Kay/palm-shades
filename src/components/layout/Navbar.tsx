"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Search, ShoppingBag, User, Menu, X, Phone } from "lucide-react";
import { FastLink } from "@/components/layout/FastLink";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart, cartSelectors } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openCart = useCart((s) => s.open);
  const cartCount = useCart(cartSelectors.count);
  const wishlistCount = useWishlist((s) => s.items.length);
  const cartHydrated = useCart((s) => s.hasHydrated);
  const wishlistHydrated = useWishlist((s) => s.hasHydrated);

  useEffect(() => {
    const handler = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setScrolled(false);
        return;
      }
      setScrolled(window.scrollY > 16);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "transition-all duration-300",
          /* Desktop: stable bar — no scroll-driven style shifts */
          "lg:border-b lg:border-blush-200/60 lg:bg-white lg:shadow-soft lg:backdrop-blur-xl",
          scrolled
            ? "border-b border-blush-200/60 bg-white/85 backdrop-blur-xl shadow-soft"
            : "border-b border-transparent bg-white/70 backdrop-blur-md lg:border-blush-200/60 lg:bg-white lg:shadow-soft"
        )}
      >
        <Container className="flex h-[72px] items-center justify-between gap-6 lg:h-20">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {siteConfig.nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <FastLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-primary-700"
                        : "text-charcoal-light hover:text-charcoal"
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-primary-500" />
                    ) : null}
                  </FastLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <FastLink
              href="/shop"
              aria-label="Search shop"
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal-light hover:bg-blush-100/70 hover:text-charcoal lg:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </FastLink>
            <FastLink
              href="/shop"
              aria-label="Search"
              className="hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal-light hover:bg-blush-100/70 hover:text-charcoal lg:inline-flex"
            >
              <Search className="h-[18px] w-[18px]" />
            </FastLink>
            <FastLink
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal-light hover:bg-blush-100/70 hover:text-charcoal lg:inline-flex"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistHydrated && wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </FastLink>
            <FastLink
              href="/account"
              aria-label="Account"
              className="hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal-light hover:bg-blush-100/70 hover:text-charcoal lg:inline-flex"
            >
              <User className="h-[18px] w-[18px]" />
            </FastLink>
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="relative inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-primary-500 text-charcoal shadow-[0_10px_30px_-12px_rgba(197,165,114,0.45)] transition-all hover:bg-primary-400 sm:w-auto sm:gap-2 sm:px-4 sm:hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-primary-700 sm:static sm:ml-0.5 sm:h-5 sm:min-w-[20px] sm:bg-white/20 sm:text-[11px] sm:text-white">
                {cartHydrated ? cartCount : 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
              className="ml-1 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal-light hover:bg-blush-100/70 hover:text-charcoal lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-luxe transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-blush-200/70 px-6">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-charcoal hover:bg-blush-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-6">
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <FastLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 font-display text-lg sm:text-xl",
                    active
                      ? "bg-blush-50 text-primary-700"
                      : "text-charcoal hover:bg-blush-50/60"
                  )}
                >
                  {item.label}
                </FastLink>
              );
            })}
            <div className="mt-6 grid grid-cols-3 gap-2 px-2">
              <FastLink
                href="/wishlist"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-blush-200 bg-blush-50/40 px-3 py-4 text-[11px] uppercase tracking-[0.18em] text-charcoal-light"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </FastLink>
              <FastLink
                href="/account"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-blush-200 bg-blush-50/40 px-3 py-4 text-[11px] uppercase tracking-[0.18em] text-charcoal-light"
              >
                <User className="h-5 w-5" />
                Account
              </FastLink>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openCart();
                }}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-primary-600 px-3 py-4 text-[11px] uppercase tracking-[0.18em] text-white"
              >
                <ShoppingBag className="h-5 w-5" />
                Cart {cartHydrated && cartCount > 0 ? `(${cartCount})` : ""}
              </button>
            </div>
            <FastLink
              href="/book"
              className="mt-4 mx-2 rounded-full bg-charcoal py-3.5 text-center text-sm font-medium text-white"
            >
              Book a Fitting
            </FastLink>
          </nav>
        </div>
      </div>
    </>
  );
}
