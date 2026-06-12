import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getGalleryTiles } from "@/lib/gallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, webPageSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Lookbook — Palm Shades Luxury Eyewear",
  description:
    "Browse the Palm Shades lookbook — curated sunglasses, optical frames, and boutique moments from our Accra eyewear house.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const tiles = await getGalleryTiles();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: "Palm Shades Gallery",
          description:
            "Photo lookbook of luxury eyewear and boutique highlights in Accra.",
          path: "/gallery",
        })}
      />
      <section className="border-b border-blush-200/60 bg-gradient-luxe py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="The lookbook"
            title="Inside the Palm Shades world."
            description="Golden hour on Accra rooftops, boutique fittings, and eyewear styled for us — by us."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid auto-rows-[minmax(160px,1fr)] grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[minmax(200px,1fr)] md:gap-4 lg:auto-rows-[minmax(240px,1fr)]">
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={`group relative overflow-hidden rounded-3xl ${tile.span}`}
              >
                <SmartImage
                  src={tile.imageUrl}
                  alt={tile.alt ?? tile.title ?? "Gallery"}
                  variant={
                    (tile.variant as "rose" | "blush" | "ivory" | "gold" | "charcoal") ?? "rose"
                  }
                  className="object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-[1.03] sm:object-center"
                  sizes={IMAGE_SIZES.galleryTile}
                  loading="lazy"
                />
                {tile.title ? (
                  <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between opacity-100 sm:inset-x-4 sm:bottom-4 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-charcoal backdrop-blur">
                      {tile.title}
                    </span>
                    <a
                      href={siteConfig.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary-700 backdrop-blur"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
