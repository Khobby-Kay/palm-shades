"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", Icon: Package },
  { href: "/account/bookings", label: "Bookings", Icon: Calendar },
  { href: "/account/children", label: "Guest profiles", Icon: Users },
];

export function AccountNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <nav>
      <div className="mb-4 px-1 lg:mb-6 lg:px-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-charcoal-light">
          Signed in as
        </p>
        <p className="mt-1 truncate font-display text-lg text-charcoal lg:text-xl">
          {userName ?? "Member"}
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors lg:gap-3 lg:rounded-2xl lg:py-3 lg:text-sm lg:normal-case lg:tracking-normal",
              active
                ? "bg-primary-600 text-white shadow-soft"
                : "bg-blush-50 text-charcoal-light ring-1 ring-blush-200 lg:bg-transparent lg:ring-0 lg:hover:bg-blush-50 lg:hover:text-charcoal"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-blush-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-light transition-colors hover:bg-blush-50 hover:text-charcoal lg:justify-start lg:rounded-2xl lg:py-3 lg:text-sm lg:normal-case lg:tracking-normal"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </nav>
  );
}
