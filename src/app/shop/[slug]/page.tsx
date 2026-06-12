import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductActions } from "@/components/shop/ProductActions";
import { RecordProductView } from "@/components/personalization/RecordProductView";
import { PersonalizedRelatedProducts } from "@/components/personalization/PersonalizedRelatedProducts";
import {
  getCatalogProductBySlug,
  getCatalogProducts,
} from "@/lib/catalog";
import { categories } from "@/lib/data/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductImage, brandImages } from "@/lib/media";
import {
  breadcrumbSchema,
  buildMetadata,
  productSchema,
} from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

function resolveProductImage(slug: string, imageUrl?: string | null, images: string[] = []) {
  const fromGallery = images.find((url) => url?.trim());
  return imageUrl ?? fromGallery ?? getProductImage(slug) ?? brandImages.bobWhite;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getCatalogProductBySlug(params.slug);
  if (!product) return { title: "Not found" };
  const image = resolveProductImage(product.slug, product.imageUrl, product.images);
  return buildMetadata({
    title: `${product.name} — Buy Online | Palm Shades Accra`,
    description: `${product.shortDesc} Shop ${product.name} at Palm Shades boutique in Accra, Ghana.`,
    path: `/shop/${product.slug}`,
    image,
    imageAlt: product.name,
    type: "website",
    keywords: [
      product.name,
      "buy eyewear Accra",
      product.categorySlug.replace("-", " "),
      "Palm Shades boutique",
    ],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getCatalogProductBySlug(params.slug);
  if (!product) notFound();

  const allProducts = await getCatalogProducts();
  const category = categories.find((c) => c.slug === product.categorySlug);
  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;
  const discountPct = onSale
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100
      )
    : null;

  const mainImage = resolveProductImage(product.slug, product.imageUrl, product.images);
  const images = product.images.filter((url) => url?.trim()).length
    ? product.images.filter((url) => url?.trim())
    : [mainImage];

  return (
    <>
      <RecordProductView
        productId={product.id}
        slug={product.slug}
        categorySlug={product.categorySlug}
      />
      <JsonLd
        data={[
          productSchema(product, mainImage),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            ...(category
              ? [{ name: category.name, path: `/shop?category=${category.slug}` }]
              : []),
            { name: product.name, path: `/shop/${product.slug}` },
          ]),
        ]}
      />
      {/* Breadcrumb */}
      <Container className="pt-8 md:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs uppercase tracking-[0.18em] text-charcoal-light scrollbar-none"
        >
          <Link href="/" className="shrink-0 hover:text-primary-700">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="shrink-0 hover:text-primary-700">
            Shop
          </Link>
          {category ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/shop?category=${category.slug}`}
                className="shrink-0 hover:text-primary-700"
              >
                {category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="max-w-[45vw] truncate text-charcoal sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </Container>

      <Container className="py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={images} alt={product.name} />

          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                  <Sparkles className="h-3 w-3" />
                  Best Seller
                </span>
              ) : null}
              {product.isNew ? (
                <span className="rounded-full bg-primary-600 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                  New Arrival
                </span>
              ) : null}
              {onSale ? (
                <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                  Save {discountPct}%
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-display-md text-charcoal">
              {product.name}
            </h1>
            <p className="text-base leading-relaxed text-charcoal-light md:text-lg">
              {product.shortDesc}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-primary-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : "opacity-30"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-charcoal-light">
                {product.rating.toFixed(1)} &middot; {product.reviewCount} reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl text-charcoal sm:text-4xl">
                {formatPrice(product.price, { currency: product.currency })}
              </span>
              {onSale ? (
                <span className="font-display text-xl text-charcoal-light line-through">
                  {formatPrice(product.compareAtPrice!, {
                    currency: product.currency,
                  })}
                </span>
              ) : null}
            </div>

            <ProductActions product={product} imageUrl={mainImage} />

            {/* Trust strip */}
            <div className="grid gap-3 rounded-3xl border border-blush-200/70 bg-blush-50/50 p-5 sm:grid-cols-3">
              {[
                {
                  Icon: Truck,
                  title: "Free delivery",
                  body: "On orders over GHS 500",
                },
                {
                  Icon: ShieldCheck,
                  title: "Authentic",
                  body: "Certified lenses & genuine materials",
                },
                {
                  Icon: Sparkles,
                  title: "30-day promise",
                  body: "Loved or your money back",
                },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary-700 ring-1 ring-blush-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-charcoal">{title}</p>
                    <p className="text-[11px] text-charcoal-light">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + meta */}
        <div className="mt-20 grid gap-12 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <h2 className="font-display text-2xl text-charcoal">About this product</h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal-light">
              {product.description}
            </p>

            {product.usage ? (
              <div className="mt-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                  Care & fitting
                </p>
                <p className="mt-3 text-base leading-relaxed text-charcoal">
                  {product.usage}
                </p>
              </div>
            ) : null}

            {product.ingredients ? (
              <div className="mt-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                  Materials & lenses
                </p>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                  {product.ingredients}
                </p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5 rounded-3xl border border-blush-200/70 bg-white p-8 shadow-card">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
              At a glance
            </p>
            <dl className="space-y-4 text-sm">
              {[
                { k: "Category", v: category?.name ?? "—" },
                { k: "Fit", v: "Unisex" },
                { k: "Stock", v: product.stock > 0 ? `${product.stock} in stock` : "Sold out" },
                {
                  k: "Rating",
                  v: `${product.rating.toFixed(1)} from ${product.reviewCount} reviews`,
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-baseline justify-between gap-4 border-b border-blush-200/60 pb-3 last:border-none last:pb-0"
                >
                  <dt className="text-charcoal-light">{row.k}</dt>
                  <dd className="font-medium text-charcoal">{row.v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Reviews (placeholder block) */}
        <div className="mt-12 rounded-[2rem] bg-blush-50/40 p-6 sm:mt-20 sm:p-10 md:p-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <SectionHeading
              eyebrow="What clients say"
              title={`${product.rating.toFixed(1)} out of 5 — from ${product.reviewCount} reviews`}
            />
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              See all reviews <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Akosua M.",
                rating: 5,
                body: "Perfect fit on the first try — the team really knows how to match frames to your face.",
              },
              {
                name: "Maame A.",
                rating: 5,
                body: "Beautiful craftsmanship. The champagne finish catches light in the most elegant way.",
              },
              {
                name: "Selasi T.",
                rating: 5,
                body: "Arrived in stunning packaging — felt like unboxing a piece from a European maison.",
              },
            ].map((r) => (
              <figure
                key={r.name}
                className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-card ring-1 ring-blush-200/60"
              >
                <div className="flex items-center gap-1 text-primary-600">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-30"}`}
                    />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-charcoal">
                  &ldquo;{r.body}&rdquo;
                </blockquote>
                <figcaption className="mt-auto text-xs uppercase tracking-[0.18em] text-charcoal-light">
                  {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <PersonalizedRelatedProducts
          products={allProducts}
          currentProductId={product.id}
          categorySlug={product.categorySlug}
        />
      </Container>
    </>
  );
}
