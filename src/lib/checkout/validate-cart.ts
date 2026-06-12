import { prisma } from "@/lib/prisma";
import { resolveStoredImageUrl } from "@/lib/storage/blob-access";
import type { CartItemInput } from "@/lib/validators/checkout";

export type ValidatedCartLine = {
  id: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  productCode: string | null;
  variantSku: string | null;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

export class CheckoutValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

/** Resolve cart lines against DB — server prices & stock always win. */
export async function validateCheckoutCart(
  items: CartItemInput[]
): Promise<ValidatedCartLine[]> {
  const fieldErrors: Record<string, string> = {};
  const lines: ValidatedCartLine[] = [];

  for (const item of items) {
    const productId = item.productId ?? item.id;
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      fieldErrors.items = `"${item.name}" is no longer available.`;
      continue;
    }

    if (product.slug !== item.slug) {
      fieldErrors.items = "Cart item mismatch — please refresh and try again.";
      continue;
    }

    let unitPrice = product.price;
    let stock = product.stock;
    let variantId: string | null = null;
    let variantName: string | null = null;
    let variantSku: string | null = null;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        fieldErrors.items = `Selected option for "${product.name}" is unavailable.`;
        continue;
      }
      variantId = variant.id;
      variantName = variant.name;
      variantSku = variant.sku;
      unitPrice = variant.price ?? product.price;
      stock = variant.stock;
    } else if (product.variants.length > 0) {
      fieldErrors.items = `Please select a variant for "${product.name}".`;
      continue;
    }

    if (item.quantity < 1 || item.quantity > 99) {
      fieldErrors.items = "Invalid quantity.";
      continue;
    }

    if (stock < item.quantity) {
      fieldErrors.items =
        stock <= 0
          ? `"${product.name}" is out of stock.`
          : `Only ${stock} left for "${product.name}".`;
      continue;
    }

    const imageUrl =
      resolveStoredImageUrl(product.images[0]?.url ?? null) ??
      item.imageUrl ??
      null;

    lines.push({
      id: variantId ?? product.id,
      productId: product.id,
      variantId,
      variantName,
      productCode: product.productCode,
      variantSku,
      slug: product.slug,
      name: product.name,
      price: unitPrice,
      currency: product.currency || item.currency || "GHS",
      imageUrl,
      quantity: item.quantity,
    });
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new CheckoutValidationError("Cart validation failed", fieldErrors);
  }

  if (lines.length === 0) {
    throw new CheckoutValidationError("Your cart is empty.", { items: "Add products to checkout." });
  }

  return lines;
}

/** Atomically reserve stock and create the order. */
export async function createOrderWithStock(
  data: Parameters<typeof prisma.order.create>[0]["data"],
  lines: ValidatedCartLine[]
) {
  return prisma.$transaction(async (tx) => {
    for (const line of lines) {
      if (line.variantId) {
        const updated = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          throw new CheckoutValidationError(`"${line.name}" is no longer in stock.`, {
            items: "Stock changed — refresh your cart.",
          });
        }
      } else {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          throw new CheckoutValidationError(`"${line.name}" is no longer in stock.`, {
            items: "Stock changed — refresh your cart.",
          });
        }
      }
    }

    return tx.order.create({ data, select: { id: true, orderNumber: true } });
  });
}
