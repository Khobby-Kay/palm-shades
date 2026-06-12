"use client";

import dynamic from "next/dynamic";
import { CartDrawer as CartDrawerImpl } from "@/components/cart/CartDrawer";
import { MobileCartFab as MobileCartFabImpl } from "@/components/cart/MobileCartFab";

const CartDrawerDynamic = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

const MobileCartFabDynamic = dynamic(
  () => import("@/components/cart/MobileCartFab").then((m) => m.MobileCartFab),
  { ssr: false }
);

/** Cart UI — static import in dev (avoids stale lazy chunks); dynamic in production. */
export const CartDrawer =
  process.env.NODE_ENV === "development" ? CartDrawerImpl : CartDrawerDynamic;

export const MobileCartFab =
  process.env.NODE_ENV === "development" ? MobileCartFabImpl : MobileCartFabDynamic;
