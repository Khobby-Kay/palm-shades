import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { BoutiqueStatusBar } from "@/components/boutique/BoutiqueStatusBar";
import { RootChrome } from "@/components/layout/RootChrome";
import { GlobalJsonLd } from "@/components/seo/GlobalJsonLd";
import { buildMetadata } from "@/lib/seo";
import { heroSlides } from "@/lib/media";
import { siteConfig } from "@/lib/site";
import { brandAssets } from "@/lib/brand-assets";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: brandAssets.colors.gold,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata({
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
    path: "/",
  }),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  applicationName: siteConfig.shortName,
  icons: {
    icon: [{ url: brandAssets.logoIcon, type: "image/png" }],
    apple: [{ url: brandAssets.logoIcon, type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.shortName,
  },
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Fashion",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  other: {
    "geo.region": "GH-AA",
    "geo.placename": "Accra",
    "geo.position": `${siteConfig.seo.geo.latitude};${siteConfig.seo.geo.longitude}`,
    ICBM: `${siteConfig.seo.geo.latitude}, ${siteConfig.seo.geo.longitude}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const buildTag =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
    "local-dev";

  return (
    <html lang="en-GH" className={`${cormorant.variable} ${outfit.variable}`}>
      <head>
        <meta name="palm-shades-build" content={buildTag} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.min.css"
        />
        <link rel="alternate" type="text/plain" href="/llms" title="LLM site summary" />
        <link
          rel="preload"
          href={heroSlides[0].image}
          as="image"
          type="image/png"
        />
      </head>
      <body className="site-body bg-background font-sans text-foreground">
        <GlobalJsonLd />
        <RootChrome
          announcement={
            <Suspense
              fallback={<div className="h-9 bg-gradient-brand" aria-hidden />}
            >
              <BoutiqueStatusBar />
            </Suspense>
          }
        >
          {children}
        </RootChrome>
      </body>
    </html>
  );
}
