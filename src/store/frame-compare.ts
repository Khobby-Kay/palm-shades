"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CompareItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  categorySlug: string;
  rating: number;
  imageUrl?: string;
};

const MAX_COMPARE = 3;

interface FrameCompareState {
  items: CompareItem[];
  hasHydrated: boolean;
  add: (item: CompareItem) => boolean;
  remove: (id: string) => void;
  toggle: (item: CompareItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useFrameCompare = create<FrameCompareState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      add: (item) => {
        if (get().items.some((i) => i.id === item.id)) return true;
        if (get().items.length >= MAX_COMPARE) return false;
        set({ items: [...get().items, item] });
        return true;
      },

      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
          return;
        }
        if (get().items.length >= MAX_COMPARE) return;
        set({ items: [...get().items, item] });
      },

      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "palm-shades-frame-compare",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

export const frameCompareSelectors = {
  count: (s: FrameCompareState) => s.items.length,
  isFull: (s: FrameCompareState) => s.items.length >= MAX_COMPARE,
};
