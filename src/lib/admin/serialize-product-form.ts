/** Plain serializable shape for the admin ProductForm (client component). */
export type ProductFormInitial = {
  id?: string;
  name: string;
  productCode: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  categoryId: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  images?: { url: string; alt: string | null }[];
  variants?: {
    sku: string;
    name: string;
    price: number | null;
    compareAtPrice: number | null;
    stock: number;
    imageUrl: string | null;
  }[];
};

export function serializeProductForForm(product: {
  id: string;
  name: string;
  productCode: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  categoryId: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  images: { url: string; alt: string | null }[];
  variants: {
    sku: string;
    name: string;
    price: number | null;
    compareAtPrice: number | null;
    stock: number;
    imageUrl: string | null;
  }[];
}): ProductFormInitial {
  return {
    id: product.id,
    name: product.name,
    productCode: product.productCode,
    slug: product.slug,
    shortDesc: product.shortDesc,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    categoryId: product.categoryId,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isActive: product.isActive,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    variants: product.variants.map((v) => ({
      sku: v.sku,
      name: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      imageUrl: v.imageUrl,
    })),
  };
}
