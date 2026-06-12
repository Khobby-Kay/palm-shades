import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import {
  formatProductValidationError,
  productWriteSchema,
  toMinorUnits,
} from "@/lib/admin/product-schema";
import { brandImages } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { prismaSequential } from "@/lib/prisma-sequential";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { where: { isActive: true } },
      _count: { select: { variants: true, images: true } },
    },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
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
  const slug = d.slug?.trim() || slugify(d.name);
  const productCode = d.productCode.trim().toUpperCase();

  const [existingSlug, existingCode] = await prismaSequential([
    () => prisma.product.findUnique({ where: { slug } }),
    () => prisma.product.findUnique({ where: { productCode } }),
  ]);
  if (existingSlug) {
    return NextResponse.json(
      { error: "A product with this slug already exists." },
      { status: 409 }
    );
  }

  if (existingCode) {
    return NextResponse.json(
      { error: "Product code already in use." },
      { status: 409 }
    );
  }

  const images =
    (d.images ?? []).length > 0
      ? d.images!
      : [{ url: brandImages.bobWhite, alt: d.name, position: 0 }];
  const variants = d.variants ?? [];

  try {
    const product = await prisma.product.create({
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
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            position: img.position ?? i,
          })),
        },
        variants: {
          create: variants.map((v, i) => ({
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
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ product });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    console.error("[admin/products POST]", msg);
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Slug, product code, or variant SKU already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Could not create product. Check database connection and try again." },
      { status: 500 }
    );
  }
}
