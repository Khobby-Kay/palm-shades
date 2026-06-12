"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getProductImage } from "@/lib/media";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import type { ProductItem } from "@/lib/data/products";

/** Shop grid card — full product visible on mobile and desktop. */
export function ShopGridCard({ product }: { product: ProductItem }) {
  const imageUrl = product.imageUrl ?? getProductImage(product.slug);
  const addToCart = useCart((s) => s.add);
  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl,
      maxStock: product.stock,
    });
  };

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F2] ring-1 ring-blush-200/60">
        <Link
          href={`/shop/${product.slug}`}
          className="relative block aspect-square p-3 sm:p-4 md:p-5"
          aria-label={product.name}
        >
          <SmartImage
            src={imageUrl}
            alt={product.name}
            variant="ivory"
            fit="contain"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
            sizes={IMAGE_SIZES.productGrid}
            loading="lazy"
          />
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1">
          {product.isBestSeller ? (
            <span className="rounded-md bg-primary-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              Best Seller
            </span>
          ) : null}
          {onSale ? (
            <span className="rounded-md bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              On Sale
            </span>
          ) : null}
          {product.isNew && !product.isBestSeller ? (
            <span className="rounded-md bg-charcoal px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              New
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
          className={cn(
            "absolute bottom-2 right-2 z-10 grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition-all hover:scale-105 hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      <div className="mt-3 px-0.5">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-charcoal transition-colors group-hover:text-primary-800 md:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-charcoal-light">
          {onSale ? (
            <>
              <span className="font-semibold text-charcoal">
                {formatPrice(product.price, { currency: product.currency })}
              </span>
              <span className="ml-1.5 text-xs line-through opacity-70">
                {formatPrice(product.compareAtPrice!, {
                  currency: product.currency,
                })}
              </span>
            </>
          ) : (
            <span>
              From{" "}
              <span className="font-semibold text-charcoal">
                {formatPrice(product.price, { currency: product.currency })}
              </span>
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
