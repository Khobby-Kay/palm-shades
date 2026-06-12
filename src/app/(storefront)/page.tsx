import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeCategoryStrip } from "@/components/home/HomeCategoryStrip";
import { HomeProductSection } from "@/components/home/HomeProductSection";
import { HomeTrustSection } from "@/components/home/HomeTrustSection";
import { HomeShopCta } from "@/components/home/HomeShopCta";
import { FrameFinderTeaser } from "@/components/frames/FrameFinderTeaser";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { buildMetadata, webPageSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.shortName} — Luxury Eyewear Boutique in Accra`,
  description: siteConfig.description,
  path: "/",
  keywords: [
    "luxury sunglasses Accra",
    "Palm Shades",
    "designer eyewear Ghana",
    "optical frames Accra",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: `${siteConfig.name} — ${siteConfig.tagline}`,
          description: siteConfig.description,
          path: "/",
        })}
      />
      <HeroSection />
      <HomeCategoryStrip />
      <Suspense fallback={<SectionSkeleton rows={2} />}>
        <HomeProductSection variant="trending" />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={2} />}>
        <HomeProductSection variant="newArrivals" />
      </Suspense>
      <FrameFinderTeaser />
      <HomeTrustSection />
      <HomeShopCta />
    </>
  );
}
