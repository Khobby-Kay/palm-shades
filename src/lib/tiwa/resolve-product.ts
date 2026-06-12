import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { prisma } from "@/lib/prisma";
import { minorToMajor } from "@/lib/sync/money";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProductRef = {
  id?: string;
  productId?: string;
  slug?: string;
  name?: string;
};

async function syncPrismaProductToSupabase(
  prismaId: string,
  slug?: string
): Promise<string | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: prismaId },
          ...(slug ? [{ slug }] : []),
        ],
      },
      select: {
        id: true,
        supabaseId: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        productCode: true,
      },
    });
    if (!product) return null;
    if (product.supabaseId) return product.supabaseId;

    const { data: created, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: product.name,
        slug: product.slug,
        price: minorToMajor(product.price),
        quantity: product.stock,
        sku: product.productCode,
        status: product.isActive ? "active" : "draft",
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      console.error("[resolve-product] Supabase insert failed:", error?.message);
      return null;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { supabaseId: created.id },
    });

    return created.id;
  } catch (err) {
    console.error("[resolve-product] Prisma sync failed:", err);
    return null;
  }
}

export async function resolveSupabaseProductId(
  item: ProductRef
): Promise<string | null> {
  if (item.slug) {
    const { data: bySlug } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", item.slug)
      .maybeSingle();
    if (bySlug?.id) return bySlug.id;
  }

  const prismaId = item.productId || item.id;
  if (prismaId && !UUID_RE.test(prismaId)) {
    try {
      const product = await prisma.product.findFirst({
        where: { OR: [{ id: prismaId }, { slug: item.slug ?? "" }] },
        select: { supabaseId: true },
      });
      if (product?.supabaseId) return product.supabaseId;

      const synced = await syncPrismaProductToSupabase(prismaId, item.slug);
      if (synced) return synced;
    } catch {
      // Prisma unavailable — continue with Supabase-only lookups
    }
  }

  const candidates = [item.productId, item.id].filter(Boolean) as string[];
  for (const candidate of candidates) {
    if (!UUID_RE.test(candidate)) continue;
    const { data } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (item.slug) {
    const synced = await syncPrismaProductToSupabase("", item.slug);
    if (synced) return synced;
  }

  return null;
}
