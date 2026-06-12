import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, itemListSchema } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { ShopIntentBanner } from "@/components/shop/ShopIntentBanner";
import { ShopCommunityCta } from "@/components/shop/ShopCommunityCta";
import { getCatalogProducts } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog";
import { categories } from "@/lib/data/categories";
import { PRICE_RANGES } from "@/components/shop/PriceFilter";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Shop Eyewear — Luxury Sunglasses & Frames in Accra",
  description:
    "Shop curated sunglasses, optical frames, blue-light glasses and accessories at Palm Shades — Accra's luxury eyewear boutique with delivery across Ghana.",
  path: "/shop",
  keywords: [
    "sunglasses shop Accra",
    "designer eyewear Ghana",
    "optical frames Accra",
    "luxury glasses online Ghana",
    "Palm Shades shop",
  ],
});

const PAGE_SIZE = 12;

type SearchParams = {
  category?: string;
  price?: string;
  tag?: string;
  q?: string;
  sort?: string;
  page?: string;
};

function applyFilters(
  list: CatalogProduct[],
  sp: SearchParams
): CatalogProduct[] {
  let out = [...list];

  if (sp.category) {
    out = out.filter((p) => p.categorySlug === sp.category);
  }

  if (sp.price) {
    const range = PRICE_RANGES.find((r) => r.id === sp.price);
    if (range) {
      out = out.filter((p) => p.price >= range.min && p.price <= range.max);
    }
  }

  if (sp.tag) {
    if (sp.tag === "new") out = out.filter((p) => p.isNew);
    if (sp.tag === "best-seller") out = out.filter((p) => p.isBestSeller);
    if (sp.tag === "sale")
      out = out.filter(
        (p) =>
          typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price
      );
  }

  if (sp.q && sp.q.trim()) {
    const q = sp.q.trim().toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  switch (sp.sort) {
    case "newest":
      out = [...out].sort(
        (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || 0
      );
      break;
    case "price-asc":
      out = [...out].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out = [...out].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      out = [...out].sort((a, b) => b.rating - a.rating);
      break;
    default:
      out = [...out].sort((a, b) => {
        const fa = Number(!!a.isFeatured);
        const fb = Number(!!b.isFeatured);
        if (fb !== fa) return fb - fa;
        return b.rating - a.rating;
      });
  }

  return out;
}

function buildPageHref(searchParams: SearchParams, page: number) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v != null && k !== "page") usp.set(k, String(v));
  }
  if (page > 1) usp.set("page", String(page));
  const q = usp.toString();
  return q ? `/shop?${q}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const products = await getCatalogProducts();
  const filtered = applyFilters(products, searchParams);

  const baseForCounts = applyFilters(products, {
    ...searchParams,
    category: undefined,
  });
  const counts: Record<string, number> = {};
  for (const c of categories) {
    counts[c.slug] = baseForCounts.filter((p) => p.categorySlug === c.slug).length;
  }

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const pageHrefs = Array.from({ length: totalPages }, (_, i) =>
    buildPageHref(searchParams, i + 1)
  );

  const activeCategory = categories.find((c) => c.slug === searchParams.category);
  const hasFilters =
    !!searchParams.category ||
    !!searchParams.price ||
    !!searchParams.tag ||
    !!(searchParams.q && searchParams.q.trim());

  return (
    <>
      <JsonLd
        data={itemListSchema({
          name: "Palm Shades Boutique — Products",
          path: "/shop",
          items: products.map((p) => ({
            name: p.name,
            url: `/shop/${p.slug}`,
          })),
        })}
      />

      <ShopHero activeCategory={activeCategory} />

      <section className="bg-blush-50/80 pb-8 md:pb-12">
        <Container className="pt-5 md:pt-8">
          <ShopIntentBanner products={products} />
          <ShopPageClient
            products={paged}
            filteredProducts={filtered}
            sortMode={searchParams.sort ?? "featured"}
            pageSize={PAGE_SIZE}
            filteredCount={filtered.length}
            totalPages={totalPages}
            currentPage={safePage}
            counts={counts}
            hasFilters={hasFilters}
            activeCategorySlug={searchParams.category}
            pageHrefs={pageHrefs}
          />
        </Container>
      </section>

      <ShopCommunityCta />
    </>
  );
}
