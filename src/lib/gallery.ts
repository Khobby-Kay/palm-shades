import { unstable_cache } from "next/cache";
import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { media } from "@/lib/media";

export type GalleryTile = {
  id: string;
  title: string | null;
  imageUrl: string;
  alt: string | null;
  span: string;
  variant: string;
};

const FALLBACK_SPANS = [
  "row-span-2 col-span-1",
  "col-span-2 row-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
];

const FALLBACK_VARIANTS = [
  "gold",
  "ivory",
  "gold",
  "ivory",
  "gold",
  "ivory",
  "charcoal",
  "gold",
  "ivory",
];

const FALLBACK_LABELS = [
  "Rooftop golden hour",
  "Butterfly sunglasses",
  "Osu street style",
  "Boutique fitting",
  "Leather case detail",
  "Inside Palm Shades",
  "Aviator campaign",
  "Coastline luxury",
  "Polarized round",
];

function fallbackTiles(): GalleryTile[] {
  return media.gallery.map((url, i) => ({
    id: `fallback-${i}`,
    title: FALLBACK_LABELS[i] ?? null,
    imageUrl: url,
    alt: FALLBACK_LABELS[i] ?? "Palm Shades lookbook",
    span: FALLBACK_SPANS[i] ?? "col-span-1",
    variant: FALLBACK_VARIANTS[i] ?? "gold",
  }));
}

async function loadGalleryTiles(): Promise<GalleryTile[]> {
  if (!hasDatabase()) return fallbackTiles();

  const items = await prisma.galleryItem
    .findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    })
    .catch(() => []);

  if (items.length > 0) {
    return items.map((it) => ({
      id: it.id,
      title: it.title,
      imageUrl: it.imageUrl,
      alt: it.alt,
      span: it.span,
      variant: it.variant,
    }));
  }

  return fallbackTiles();
}

const getCachedGalleryTiles = unstable_cache(
  loadGalleryTiles,
  ["palm-shades-gallery-tiles-v2"],
  { revalidate: 300, tags: ["gallery"] }
);

export async function getGalleryTiles(): Promise<GalleryTile[]> {
  return getCachedGalleryTiles();
}
