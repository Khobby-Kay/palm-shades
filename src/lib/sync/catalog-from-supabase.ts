import { prisma } from "@/lib/prisma";
import { BRAND_SKU_PREFIX } from "@/lib/product-codes";
import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { isSupabaseSyncConfigured } from "@/lib/sync/config";
import { majorToMinor } from "@/lib/sync/money";

export type CatalogSyncResult = {
  ok: boolean;
  categories: number;
  products: number;
  variants: number;
  slug?: string;
  error?: string;
};

type SbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number | null;
  status: string | null;
};

type SbProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  quantity: number | null;
  status: string | null;
  featured: boolean | null;
  category_id: string | null;
  rating_avg: number | null;
  review_count: number | null;
  metadata: Record<string, unknown> | null;
  product_images?: Array<{ url: string; alt_text: string | null; position: number | null }>;
  product_variants?: Array<{
    id: string;
    name: string;
    sku: string | null;
    price: number;
    compare_at_price: number | null;
    quantity: number | null;
    image_url: string | null;
  }>;
};

const PRODUCT_SELECT = `
  id, name, slug, description, short_description, price, compare_at_price,
  sku, quantity, status, featured, category_id, rating_avg, review_count, metadata,
  product_images(url, alt_text, position),
  product_variants(id, name, sku, price, compare_at_price, quantity, image_url)
`;

function productCodeFromSb(p: SbProduct): string {
  if (p.sku?.trim()) return p.sku.trim().slice(0, 64);
  return `${BRAND_SKU_PREFIX}-${p.slug.replace(/[^a-z0-9-]/gi, "-").toUpperCase().slice(0, 40)}`;
}

async function buildCategoryMap(): Promise<Map<string, string>> {
  const { data: sbCategories, error: catErr } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, description, position, status")
    .eq("status", "active");

  if (catErr) throw new Error(catErr.message);

  const categoryIdBySb = new Map<string, string>();

  for (const c of (sbCategories ?? []) as SbCategory[]) {
    const existing = await prisma.category.findFirst({
      where: { OR: [{ supabaseId: c.id }, { slug: c.slug }] },
    });
    const data = {
      supabaseId: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      position: c.position ?? 0,
    };
    const row = existing
      ? await prisma.category.update({ where: { id: existing.id }, data })
      : await prisma.category.create({ data });
    categoryIdBySb.set(c.id, row.id);
  }

  return categoryIdBySb;
}

async function upsertSbProduct(
  p: SbProduct,
  categoryIdBySb: Map<string, string>
): Promise<{ variants: number; slug: string }> {
  const isActive = p.status === "active";
  const categoryId = p.category_id ? categoryIdBySb.get(p.category_id) ?? null : null;
  const meta = (p.metadata ?? {}) as Record<string, unknown>;
  const code = productCodeFromSb(p);

  const existingProduct = await prisma.product.findFirst({
    where: { OR: [{ supabaseId: p.id }, { slug: p.slug }] },
  });
  const productData = {
    supabaseId: p.id,
    productCode: code,
    slug: p.slug,
    name: p.name,
    description: p.description,
    shortDesc: p.short_description,
    price: majorToMinor(p.price),
    compareAtPrice: p.compare_at_price != null ? majorToMinor(p.compare_at_price) : null,
    currency: "GHS",
    stock: p.quantity ?? 0,
    isFeatured: !!p.featured,
    isNew: meta.is_new === true || meta.isNew === true,
    isBestSeller: meta.is_bestseller === true || meta.isBestSeller === true,
    isActive,
    rating: Number(p.rating_avg ?? 0),
    reviewCount: Number(p.review_count ?? 0),
    categoryId,
  };
  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: productData,
      })
    : await prisma.product.create({ data: productData });

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  const images = [...(p.product_images ?? [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img, i) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt_text,
        position: img.position ?? i,
      })),
    });
  }

  const sbVariantIds = new Set<string>();
  let variantCount = 0;
  for (const v of p.product_variants ?? []) {
    sbVariantIds.add(v.id);
    const variantSku = v.sku?.trim() || `${code}-${v.name.replace(/\s+/g, "-").slice(0, 24)}`;
    const existingVariant = await prisma.productVariant.findFirst({
      where: { OR: [{ supabaseId: v.id }, { sku: variantSku }] },
    });
    const variantData = {
      supabaseId: v.id,
      productId: product.id,
      sku: variantSku,
      name: v.name,
      price: majorToMinor(v.price),
      compareAtPrice:
        v.compare_at_price != null ? majorToMinor(v.compare_at_price) : null,
      stock: v.quantity ?? 0,
      imageUrl: v.image_url,
      isActive: true,
    };
    if (existingVariant) {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: variantData,
      });
    } else {
      await prisma.productVariant.create({ data: variantData });
    }
    variantCount++;
  }

  if (sbVariantIds.size > 0) {
    await prisma.productVariant.updateMany({
      where: {
        productId: product.id,
        supabaseId: { notIn: [...sbVariantIds] },
      },
      data: { isActive: false },
    });
  }

  return { variants: variantCount, slug: p.slug };
}

/**
 * Sync one product to the storefront (fast path after admin save).
 */
export async function syncProductFromSupabase(
  supabaseProductId: string
): Promise<CatalogSyncResult> {
  if (!isSupabaseSyncConfigured()) {
    return {
      ok: false,
      categories: 0,
      products: 0,
      variants: 0,
      error: "Supabase sync not configured",
    };
  }

  try {
    const categoryIdBySb = await buildCategoryMap();

    const { data: raw, error: prodErr } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", supabaseProductId)
      .single();

    if (prodErr || !raw) throw new Error(prodErr?.message ?? "Product not found");

    const { variants, slug } = await upsertSbProduct(raw as SbProduct, categoryIdBySb);

    return {
      ok: true,
      categories: 0,
      products: 1,
      variants,
      slug,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Product sync failed";
    console.error("[sync] product-from-supabase:", msg);
    return { ok: false, categories: 0, products: 0, variants: 0, error: msg };
  }
}

/**
 * Pull full catalog from Supabase (Tiwa admin) into Prisma (Palm Shades storefront).
 * Use for bulk import / manual sync — not on every product save.
 */
export async function syncCatalogFromSupabase(): Promise<CatalogSyncResult> {
  if (!isSupabaseSyncConfigured()) {
    return { ok: false, categories: 0, products: 0, variants: 0, error: "Supabase sync not configured" };
  }

  try {
    const categoryIdBySb = await buildCategoryMap();

    const { data: sbProducts, error: prodErr } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .order("updated_at", { ascending: false });

    if (prodErr) throw new Error(prodErr.message);

    let productCount = 0;
    let variantCount = 0;
    const syncedSlugs = new Set<string>();

    for (const raw of sbProducts ?? []) {
      const p = raw as SbProduct;
      syncedSlugs.add(p.slug);
      const { variants } = await upsertSbProduct(p, categoryIdBySb);
      variantCount += variants;
      productCount++;
    }

    await prisma.product.updateMany({
      where: {
        supabaseId: { not: null },
        slug: { notIn: [...syncedSlugs] },
      },
      data: { isActive: false },
    });

    return {
      ok: true,
      categories: categoryIdBySb.size,
      products: productCount,
      variants: variantCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Catalog sync failed";
    console.error("[sync] catalog-from-supabase:", msg);
    return { ok: false, categories: 0, products: 0, variants: 0, error: msg };
  }
}
