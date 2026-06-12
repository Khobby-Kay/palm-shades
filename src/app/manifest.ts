import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { brandAssets } from "@/lib/brand-assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Palm Shades",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAF7F2",
    theme_color: brandAssets.colors.gold,
    lang: siteConfig.locale,
    categories: ["shopping", "lifestyle", "fashion"],
    icons: [
      {
        src: "/images/palm-shades-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/palm-shades-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
