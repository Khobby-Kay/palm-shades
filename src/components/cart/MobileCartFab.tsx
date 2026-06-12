"use client";

import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart, cartSelectors } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

/** Floating cart button on mobile — sits above the bottom tab bar. */
export function MobileCartFab() {
  const pathname = usePathname();
  const open = useCart((s) => s.open);
  const count = useCart(cartSelectors.count);
  const subtotal = useCart(cartSelectors.subtotal);
  const hydrated = useCart((s) => s.hasHydrated);

  if (
    !hydrated ||
    count === 0 ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/book")
  ) {
    return null;
  }

  const currency = useCart.getState().items[0]?.currency ?? "GHS";

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${count} items`}
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-3 text-white shadow-luxe transition-transform active:scale-95 lg:hidden"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-primary-600">
        <ShoppingBag className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary-700">
          {count}
        </span>
      </span>
      <span className="text-left">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          View cart
        </span>
        <span className="block font-display text-sm leading-tight">
          {formatPrice(subtotal, { currency })}
        </span>
      </span>
    </button>
  );
}
