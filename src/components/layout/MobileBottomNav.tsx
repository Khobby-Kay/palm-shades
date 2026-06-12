"use client";

import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Glasses, Calendar, User } from "lucide-react";
import { FastLink } from "@/components/layout/FastLink";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", Icon: Home, match: (p: string) => p === "/" },
  { href: "/shop", label: "Shop", Icon: ShoppingBag, match: (p: string) => p.startsWith("/shop") },
  {
    href: "/services",
    label: "Services",
    Icon: Glasses,
    match: (p: string) => p.startsWith("/services"),
  },
  { href: "/book", label: "Fitting", Icon: Calendar, match: (p: string) => p.startsWith("/book") },
  {
    href: "/account",
    label: "Account",
    Icon: User,
    match: (p: string) => p.startsWith("/account"),
  },
] as const;

/** Fixed bottom tab bar — mobile & tablet only (`lg:hidden`). */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-blush-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Primary mobile navigation"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <FastLink
                href={href}
                className={cn(
                  "relative flex h-full min-h-[48px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors sm:text-[11px] sm:tracking-[0.1em]",
                  active ? "text-primary-700" : "text-charcoal-light hover:text-charcoal"
                )}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", active && "text-primary-600")}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span className="truncate">{label}</span>
                {active ? (
                  <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-primary-600" />
                ) : null}
              </FastLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
