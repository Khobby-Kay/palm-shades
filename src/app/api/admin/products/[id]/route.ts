import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import {
  formatProductValidationError,
  productWriteSchema,
  toMinorUnits,
} from "@/lib/admin/product-schema";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = productWriteSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return NextResponse.json(
      {
        error: formatProductValidationError(flat),
        details: flat,
      },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const id = params.id;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, productCode: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const productCode = d.productCode.trim().toUpperCase();
  if (productCode !== existing.productCode) {
    const clash = await prisma.product.findFirst({
      where: { productCode, NOT: { id } },
    });
    if (clash) {
      return NextResponse.json(
        { error: "Product code already in use." },
        { status: 409 }
      );
    }
  }

  const slug = d.slug?.trim() || slugify(d.name) || existing.slug;

  const slugClash = await prisma.product.findFirst({
    where: { slug, NOT: { id } },
  });
  if (slugClash) {
    return NextResponse.json(
      { error: "A product with this slug already exists." },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: d.name,
          productCode,
          slug,
          shortDesc: d.shortDesc,
          description: d.description,
          price: toMinorUnits(d.priceGhs),
          compareAtPrice: d.compareAtPriceGhs
            ? toMinorUnits(d.compareAtPriceGhs)
            : null,
          stock: d.stock,
          categoryId: d.categoryId || null,
          isFeatured: d.isFeatured ?? false,
          isNew: d.isNew ?? false,
          isBestSeller: d.isBestSeller ?? false,
          isActive: d.isActive ?? true,
        },
      });

      if (d.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (d.images.length > 0) {
          await tx.productImage.createMany({
            data: d.images.map((img, i) => ({
              productId: id,
              url: img.url,
              alt: img.alt ?? null,
              position: img.position ?? i,
            })),
          });
        }
      }

      if (d.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (d.variants.length > 0) {
          await tx.productVariant.createMany({
            data: d.variants.map((v, i) => ({
              productId: id,
              sku: v.sku.trim().toUpperCase(),
              name: v.name,
              price: v.priceGhs != null ? toMinorUnits(v.priceGhs) : null,
              compareAtPrice:
                v.compareAtPriceGhs != null
                  ? toMinorUnits(v.compareAtPriceGhs)
                  : null,
              stock: v.stock,
              imageUrl: v.imageUrl ?? null,
              position: v.position ?? i,
              isActive: v.isActive ?? true,
            })),
          });
        }
      }
    });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
        category: true,
      },
    });

    return NextResponse.json({ product });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    console.error("[admin/products PATCH]", msg);
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Slug, product code, or variant SKU already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
