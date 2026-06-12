import { Container } from "@/components/ui/Container";
import { HomeAnimatedHeader } from "@/components/home/HomeAnimatedHeader";
import { HomeProductGrid } from "@/components/home/HomeProductGrid";
import { getCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { homeSections } from "@/lib/data/homepage";

type HomeProductSectionProps = {
  variant: "trending" | "newArrivals";
};

function pickProducts(
  all: CatalogProduct[],
  variant: HomeProductSectionProps["variant"]
): CatalogProduct[] {
  const limit = 8;
  if (variant === "trending") {
    const featured = all.filter((p) => p.isFeatured || p.isBestSeller);
    if (featured.length >= 4) return featured.slice(0, limit);
    return all.slice(0, limit);
  }
  const fresh = all.filter((p) => p.isNew);
  if (fresh.length >= 4) return fresh.slice(0, limit);
  return all.slice(0, limit);
}

export async function HomeProductSection({ variant }: HomeProductSectionProps) {
  const config =
    variant === "trending" ? homeSections.trending : homeSections.newArrivals;
  const products = pickProducts(await getCatalogProducts(), variant);

  return (
    <section
      className={
        variant === "trending"
          ? "bg-blush-50/60 py-12 md:py-16"
          : "bg-white py-12 md:py-16"
      }
    >
      <Container>
        <HomeAnimatedHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={"description" in config ? config.description : undefined}
          ctaHref={config.cta.href}
          ctaLabel={config.cta.label}
        />

        <HomeProductGrid products={products} />
      </Container>
    </section>
  );
}
