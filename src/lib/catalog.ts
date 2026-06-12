import { cache } from "react";
import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { products as staticProducts, type ProductItem } from "@/lib/data/products";
import { getProductImage, brandImages } from "@/lib/media";
import { resolveStoredImageUrl } from "@/lib/storage/blob-access";

function staticCatalogFallback(): CatalogProduct[] {
  return staticProducts.map((p) => ({
    ...p,
    productCode: p.id.toUpperCase(),
    images: p.imageUrl ? [p.imageUrl] : [getProductImage(p.slug) ?? brandImages.bobWhite],
    variants: [],
  }));
}

export type CatalogVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
};

export type CatalogProduct = ProductItem & {
  productCode: string;
  images: string[];
  variants: CatalogVariant[];
  /** From Supabase metadata — "inches" for wigs, "size" for clothing */
  variantDimension?: "size" | "inches";
};

function mapDbProduct(
  p: {
    id: string;
    productCode: string;
    slug: string;
    name: string;
    shortDesc: string | null;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    currency: string;
    stock: number;
    rating: number;
    reviewCount: number;
    ingredients: string | null;
    usage: string | null;
    isFeatured: boolean;
    isNew: boolean;
    isBestSeller: boolean;
    category: { slug: string } | null;
    images: { url: string; position: number }[];
    variants: {
      id: string;
      sku: string;
      name: string;
      price: number | null;
      compareAtPrice: number | null;
      stock: number;
      imageUrl: string | null;
      isActive: boolean;
      position: number;
    }[];
  }
): CatalogProduct {
  const imageUrls = p.images
    .sort((a, b) => a.position - b.position)
    .map((i) => resolveStoredImageUrl(i.url))
    .filter((url): url is string => Boolean(url?.trim()));
  const fallbackImage =
    imageUrls[0] ?? getProductImage(p.slug) ?? brandImages.bobWhite;

  const activeVariants = p.variants
    .filter((v) => v.isActive)
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price ?? p.price,
      compareAtPrice: v.compareAtPrice ?? p.compareAtPrice ?? undefined,
      stock: v.stock,
      imageUrl: v.imageUrl ? resolveStoredImageUrl(v.imageUrl) : fallbackImage,
    }));

  const variantDimension = activeVariants.some((v) => /\d+\s*"/.test(v.name))
    ? ("inches" as const)
    : ("size" as const);

  const totalStock =
    activeVariants.length > 0
      ? activeVariants.reduce((s, v) => s + v.stock, 0)
      : p.stock;

  return {
    id: p.id,
    productCode: p.productCode,
    slug: p.slug,
    name: p.name,
    shortDesc: p.shortDesc ?? "",
    description: p.description ?? "",
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    currency: p.currency,
    categorySlug: p.category?.slug ?? "uncategorized",
    rating: p.rating,
    reviewCount: p.reviewCount,
    ingredients: p.ingredients ?? undefined,
    usage: p.usage ?? undefined,
    stock: totalStock,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    imageUrl: fallbackImage,
    images: imageUrls.length ? imageUrls : fallbackImage ? [fallbackImage] : [],
    variants: activeVariants,
    variantDimension,
  };
}

const productInclude = {
  category: { select: { slug: true } },
  images: { orderBy: { position: "asc" as const } },
  variants: { orderBy: { position: "asc" as const } },
} as const;

export const getCatalogProducts = cache(async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!hasDatabase()) return staticCatalogFallback();

  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
      orderBy: { name: "asc" },
    });

    if (rows.length === 0) return staticCatalogFallback();
    return rows.map(mapDbProduct);
  } catch {
    return staticCatalogFallback();
  }
});

export const getCatalogProductBySlug = cache(async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  if (!hasDatabase()) {
    const p = staticProducts.find((x) => x.slug === slug);
    if (!p) return null;
    return {
      ...p,
      productCode: p.id.toUpperCase(),
      images: p.imageUrl ? [p.imageUrl] : [getProductImage(p.slug) ?? brandImages.bobWhite],
      variants: [],
    };
  }

  try {
    const row = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: productInclude,
    });

    if (row) return mapDbProduct(row);

    const p = staticProducts.find((x) => x.slug === slug);
    if (!p) return null;
    return {
      ...p,
      productCode: p.id.toUpperCase(),
      images: p.imageUrl ? [p.imageUrl] : [getProductImage(p.slug) ?? brandImages.bobWhite],
      variants: [],
    };
  } catch {
    const p = staticProducts.find((x) => x.slug === slug);
    if (!p) return null;
    return {
      ...p,
      productCode: p.id.toUpperCase(),
      images: p.imageUrl ? [p.imageUrl] : [getProductImage(p.slug) ?? brandImages.bobWhite],
      variants: [],
    };
  }
});

export async function getAllCatalogSlugs(): Promise<string[]> {
  if (!hasDatabase()) return staticProducts.map((p) => p.slug);

  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    if (rows.length === 0) return staticProducts.map((p) => p.slug);
    return rows.map((r) => r.slug);
  } catch {
    return staticProducts.map((p) => p.slug);
  }
}
