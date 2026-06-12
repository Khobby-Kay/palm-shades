"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { recordCartProduct } from "@/lib/personalization/profile";

export interface CartItem {
  /** Unique line id (variant id or product id) */
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  productCode?: string;
  variantSku?: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  quantity: number;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;

  add: (
    item: Omit<CartItem, "quantity">,
    qty?: number,
    options?: { openDrawer?: boolean }
  ) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      add: (item, qty = 1, options) => {
        const openDrawer = options?.openDrawer !== false;
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          const max = existing.maxStock ?? Infinity;
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: Math.min(max, i.quantity + qty) }
                : i
            ),
            isOpen: openDrawer ? true : get().isOpen,
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: Math.max(1, qty) }],
            isOpen: openDrawer ? true : get().isOpen,
          });
        }
        recordCartProduct(item.productId);
      },

      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.maxStock ?? Infinity, qty) }
              : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "palm-shades-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<CartState> | undefined;
        const savedItems = Array.isArray(saved?.items) ? saved.items : [];
        const liveItems = Array.isArray(current.items) ? current.items : [];
        return {
          ...current,
          items: savedItems.length > 0 ? savedItems : liveItems,
        };
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

/** Derived selectors */
export const cartSelectors = {
  count: (s: CartState) => s.items.reduce((a, i) => a + i.quantity, 0),
  subtotal: (s: CartState) =>
    s.items.reduce((a, i) => a + i.price * i.quantity, 0),
};
