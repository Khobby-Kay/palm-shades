import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import type { CatalogProduct } from "@/lib/catalog";
import { products, type ProductItem } from "@/lib/data/products";

function toCatalogProduct(p: ProductItem): CatalogProduct {
  return {
    ...p,
    productCode: p.id.replace(/^p-/, "").toUpperCase(),
    images: p.imageUrl ? [p.imageUrl] : [],
    variants: [],
  };
}

export function FeaturedProducts() {
  const featured = products
    .filter((p) => p.isFeatured)
    .slice(0, 4)
    .map(toCatalogProduct);

  return (
    <section className="relative py-14 md:py-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-blush-50 to-transparent" />
      <Container>
        <SectionBlockHeader
          title="Boutique bestsellers"
          ctaHref="/shop"
          ctaLabel="Shop all"
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} variant="compact" />
          ))}
        </div>
      </Container>
    </section>
  );
}
