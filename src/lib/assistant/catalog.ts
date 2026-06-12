import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/lib/data/products";
import { getProductImage, brandImages } from "@/lib/media";
import { resolveStoredImageUrl } from "@/lib/storage/blob-access";
import type { AssistantProduct } from "@/lib/assistant/types";

const CACHE_TTL_MS = 2 * 60 * 1000;

export type AssistantProductIndex = AssistantProduct & {
  shortDesc: string;
  categorySlug: string;
};

let cached: AssistantProductIndex[] | null = null;
let cachedAt = 0;

function staticAssistantProducts(): AssistantProductIndex[] {
  return staticProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    productCode: p.id.toUpperCase(),
    currency: p.currency,
    price: p.price,
    imageUrl: p.imageUrl ?? getProductImage(p.slug) ?? brandImages.bobWhite,
    stock: p.stock,
    variants: [],
    shortDesc: p.shortDesc ?? "",
    categorySlug: p.categorySlug ?? "uncategorized",
  }));
}

function mapRow(p: {
  id: string;
  productCode: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  price: number;
  currency: string;
  stock: number;
  category: { slug: string } | null;
  images: { url: string }[];
  variants: {
    id: string;
    sku: string;
    name: string;
    price: number | null;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
    position: number;
  }[];
}): AssistantProductIndex {
  const fallbackImage =
    resolveStoredImageUrl(p.images[0]?.url) ??
    getProductImage(p.slug) ??
    brandImages.bobWhite;

  const activeVariants = p.variants
    .filter((v) => v.isActive)
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: v.price ?? p.price,
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
    slug: p.slug,
    name: p.name,
    productCode: p.productCode,
    currency: p.currency,
    price: p.price,
    imageUrl: fallbackImage,
    stock: totalStock,
    variantDimension,
    variants: activeVariants,
    shortDesc: p.shortDesc ?? "",
    categorySlug: p.category?.slug ?? "uncategorized",
  };
}

/** Lightweight, cached product index for the shopping assistant. */
export async function getAssistantProductIndex(): Promise<AssistantProductIndex[]> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) {
    return cached;
  }

  if (!hasDatabase()) {
    cached = staticAssistantProducts();
    cachedAt = now;
    return cached;
  }

  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        productCode: true,
        slug: true,
        name: true,
        shortDesc: true,
        price: true,
        currency: true,
        stock: true,
        category: { select: { slug: true } },
        images: {
          take: 1,
          orderBy: { position: "asc" },
          select: { url: true },
        },
        variants: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            isActive: true,
            position: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    cached = rows.length > 0 ? rows.map(mapRow) : staticAssistantProducts();
  } catch {
    cached = staticAssistantProducts();
  }

  cachedAt = now;
  return cached;
}
