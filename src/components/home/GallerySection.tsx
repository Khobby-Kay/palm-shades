import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getGalleryTiles } from "@/lib/gallery";

export async function GallerySection() {
  const tiles = await getGalleryTiles();

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The Lookbook"
            title="A peek inside the Palm Shades world."
            description="Quiet mornings in the boutique, freshly styled curls, and our boutique's prettiest moments."
          />
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            See the full gallery <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(140px,1fr)] grid-cols-2 gap-3 sm:grid-cols-3 sm:auto-rows-[minmax(180px,1fr)] md:grid-cols-4 md:auto-rows-[minmax(200px,1fr)] md:gap-4">
          {tiles.slice(0, 6).map((tile) => (
            <Link
              key={tile.id}
              href="/gallery"
              className={`group relative overflow-hidden rounded-3xl ${tile.span}`}
            >
              <SmartImage
                src={tile.imageUrl}
                alt={tile.alt ?? tile.title ?? "Gallery image"}
                variant={
                  (tile.variant as "rose" | "blush" | "ivory" | "gold" | "charcoal") ?? "rose"
                }
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                sizes={IMAGE_SIZES.galleryHome}
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {tile.title ? (
                <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-charcoal backdrop-blur">
                    {tile.title}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary-700 backdrop-blur">
                    <Instagram className="h-3.5 w-3.5" />
                  </span>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
