import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare Frames — Side by Side",
  description:
    "Compare up to three Palm Shades frames — lens width, bridge, temple, UV protection, and face-shape fit.",
  path: "/compare",
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
