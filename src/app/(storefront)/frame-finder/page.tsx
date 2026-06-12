import type { Metadata } from "next";
import { FrameFinder } from "@/components/frames/FrameFinder";
import { SunLensAdvisor } from "@/components/frames/SunLensAdvisor";
import { Container } from "@/components/ui/Container";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Frame Finder — Find Your Perfect Eyewear",
  description:
    "Palm Shades Frame Finder matches your face shape and lifestyle to curated sunglasses and optical frames for Accra, Ghana.",
  path: "/frame-finder",
  keywords: [
    "frame finder Accra",
    "face shape glasses guide",
    "best sunglasses for face shape Ghana",
    "Palm Shades fitting",
  ],
});

export default function FrameFinderPage() {
  return (
    <>
      <FrameFinder />
      <Container className="pb-16 md:pb-24">
        <div className="mx-auto max-w-xl">
          <SunLensAdvisor />
        </div>
      </Container>
    </>
  );
}
