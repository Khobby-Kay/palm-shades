"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer, MobileCartFab } from "@/components/layout/DeferredWidgets";
import { FrameCompareBar } from "@/components/frames/FrameCompareBar";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { isStandaloneRoute } from "@/lib/storefront-chrome";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { ChunkRecovery } from "@/components/layout/ChunkRecovery";
import { ShoppingAssistant as ShoppingAssistantImpl } from "@/components/ai/ShoppingAssistant";
import { InstallPrompt as InstallPromptImpl } from "@/components/pwa/InstallPrompt";
import { PwaRegister as PwaRegisterImpl } from "@/components/pwa/PwaRegister";

const isDev = process.env.NODE_ENV === "development";

const ShoppingAssistant = isDev
  ? ShoppingAssistantImpl
  : dynamic(
      () =>
        import("@/components/ai/ShoppingAssistant").then(
          (m) => m.ShoppingAssistant
        ),
      { ssr: false }
    );

const InstallPrompt = isDev
  ? InstallPromptImpl
  : dynamic(
      () =>
        import("@/components/pwa/InstallPrompt").then((m) => m.InstallPrompt),
      { ssr: false }
    );

const PwaRegister = isDev
  ? PwaRegisterImpl
  : dynamic(
      () => import("@/components/pwa/PwaRegister").then((m) => m.PwaRegister),
      { ssr: false }
    );

/** Storefront chrome only — admin uses its own Tiwa layout under /admin. */
export function RootChrome({
  children,
  announcement,
}: {
  children: ReactNode;
  /** Server-rendered slot — must not be imported in this client file (avoids Prisma in the browser bundle). */
  announcement?: ReactNode;
}) {
  const pathname = usePathname();

  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <ChunkRecovery />
      <NavigationProgress />
      <PwaRegister />
      <RoutePrefetcher />
      <InstallPrompt />
      <ShoppingAssistant />
      <StorefrontChrome
        announcement={announcement}
        navbar={<Navbar />}
        footer={<Footer />}
        mobileNav={<MobileBottomNav />}
        cart={
          <>
            <CartDrawer />
            <MobileCartFab />
            <FrameCompareBar />
          </>
        }
      >
        {children}
      </StorefrontChrome>
    </SessionProvider>
  );
}
