import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAuth } from "@/lib/tiwa/auth";
import {
  syncCatalogFromSupabase,
  syncProductFromSupabase,
} from "@/lib/sync/catalog-from-supabase";

export const dynamic = "force-dynamic";

function revalidateStorefront(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  if (slug) {
    revalidatePath(`/shop/${slug}`);
  } else {
    revalidatePath("/shop/[slug]", "page");
  }
}

/** POST — sync Supabase → Prisma. Body `{ productId }` = one product (fast); omit = full catalog. */
export async function POST(request: Request) {
  const auth = await verifyAuth(request, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  let productId: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.productId === "string" && body.productId.trim()) {
      productId = body.productId.trim();
    }
  } catch {
    /* full catalog sync */
  }

  const result = productId
    ? await syncProductFromSupabase(productId)
    : await syncCatalogFromSupabase();

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }

  revalidateStorefront(result.slug);

  return NextResponse.json(result);
}
