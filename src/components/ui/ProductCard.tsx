"use client";

import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { getProductImage } from "@/lib/media";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: CatalogProduct;
  variant?: "default" | "compact";
}) {
  /** Compact = PHLOX-style mobile shop card; expands to full card from `lg` up. */
  const compact = variant === "compact";
  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  const imageUrl = product.imageUrl ?? getProductImage(product.slug);
  const addToCart = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.has(product.id));
  const wishlistHydrated = useWishlist((s) => s.hasHydrated);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const v = product.variants.find((x) => x.stock > 0) ?? product.variants[0];
    if (v) {
      addToCart({
        id: v.id,
        productId: product.id,
        variantId: v.id,
        variantName: v.name,
        productCode: product.productCode,
        variantSku: v.sku,
        slug: product.slug,
        name: `${product.name} — ${v.name}`,
        price: v.price,
        currency: product.currency,
        imageUrl: v.imageUrl ?? imageUrl,
        maxStock: v.stock,
      });
    } else {
      addToCart({
        id: product.id,
        productId: product.id,
        productCode: product.productCode,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageUrl,
        maxStock: product.stock,
      });
    }
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl,
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden bg-white transition-all duration-500",
        compact
          ? "rounded-2xl shadow-soft ring-1 ring-blush-200/50 lg:rounded-3xl lg:shadow-card lg:ring-blush-200/60 lg:hover:-translate-y-1 lg:hover:shadow-luxe"
          : "rounded-3xl shadow-card ring-1 ring-blush-200/60 hover:-translate-y-1 hover:shadow-luxe"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#FAF7F2]",
          "aspect-square"
        )}
      >
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 z-[1]"
          aria-label={product.name}
        />
        <div className="absolute inset-0 p-3 sm:p-4 lg:p-5">
          <SmartImage
            src={imageUrl}
            alt={product.name}
            variant="ivory"
            fit="contain"
            className="transition-transform duration-700 group-hover:scale-[1.03]"
            sizes={IMAGE_SIZES.productGrid}
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div
          className={cn(
            "pointer-events-none absolute z-10 flex flex-col gap-1",
            compact ? "left-2 top-2 lg:left-4 lg:top-4 lg:gap-1.5" : "left-4 top-4 gap-1.5"
          )}
        >
          {product.isBestSeller ? (
            <span
              className={cn(
                "rounded-full bg-charcoal font-medium uppercase tracking-[0.18em] text-white",
                compact
                  ? "px-2 py-0.5 text-[8px] lg:px-3 lg:py-1 lg:text-[10px]"
                  : "px-3 py-1 text-[10px]"
              )}
            >
              <span className="lg:hidden">Best</span>
              <span className="hidden lg:inline">Best Seller</span>
            </span>
          ) : null}
          {product.isNew ? (
            <span
              className={cn(
                "rounded-full bg-primary-600 font-medium uppercase tracking-[0.18em] text-white",
                compact
                  ? "px-2 py-0.5 text-[8px] lg:px-3 lg:py-1 lg:text-[10px]"
                  : "px-3 py-1 text-[10px]"
              )}
            >
              New
            </span>
          ) : null}
          {onSale ? (
            <span
              className={cn(
                "rounded-full bg-gold font-medium uppercase tracking-[0.18em] text-white",
                compact
                  ? "px-2 py-0.5 text-[8px] lg:px-3 lg:py-1 lg:text-[10px]"
                  : "px-3 py-1 text-[10px]"
              )}
            >
              Sale
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWish}
          aria-label={`${wished ? "Remove from" : "Add to"} wishlist: ${product.name}`}
          className={cn(
            "absolute z-10 grid place-items-center rounded-full bg-white/85 shadow-soft backdrop-blur transition-all hover:bg-white",
            compact
              ? "right-2 top-2 h-8 w-8 lg:right-4 lg:top-4 lg:h-10 lg:w-10"
              : "right-4 top-4 h-10 w-10",
            wishlistHydrated && wished
              ? "text-primary-600"
              : "text-charcoal-light hover:text-primary-600"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlistHydrated && wished ? "fill-current" : ""
            )}
          />
        </button>

        {/* Quick add — always visible on compact / mobile shop */}
        <div
          className={cn(
            "absolute z-10 transition-all duration-500",
            compact
              ? "pointer-events-auto inset-x-2 bottom-2 opacity-100 lg:pointer-events-none lg:inset-x-4 lg:bottom-4 lg:translate-y-3 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
              : "pointer-events-none inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={cn(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-charcoal font-medium uppercase tracking-[0.18em] text-white shadow-luxe transition-all hover:bg-charcoal-soft disabled:opacity-50",
              compact
                ? "py-2 text-[9px] lg:gap-2 lg:py-3 lg:text-xs lg:tracking-[0.2em]"
                : "gap-2 py-3 text-xs tracking-[0.2em]"
            )}
          >
            <ShoppingBag
              className={compact ? "h-3 w-3 lg:h-4 lg:w-4" : "h-4 w-4"}
            />
            {product.stock === 0 ? (
              "Sold Out"
            ) : compact ? (
              <>
                <span className="lg:hidden">Add</span>
                <span className="hidden lg:inline">Add to Cart</span>
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          compact
            ? "gap-1.5 p-3 text-center lg:gap-3 lg:p-5 lg:text-left"
            : "gap-3 p-5"
        )}
      >
        {!compact ? (
        <div className="flex items-center gap-1.5 text-primary-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-current" : "opacity-30"}`}
            />
          ))}
          <span className="ml-1 text-[11px] text-charcoal-light">
            {product.rating.toFixed(1)} · {product.reviewCount}
          </span>
        </div>
        ) : (
          <div className="hidden items-center gap-1.5 text-primary-600 lg:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-current" : "opacity-30"}`}
              />
            ))}
            <span className="ml-1 text-[11px] text-charcoal-light">
              {product.rating.toFixed(1)} · {product.reviewCount}
            </span>
          </div>
        )}
        <div>
          <Link
            href={`/shop/${product.slug}`}
            className={cn(
              "font-display text-charcoal hover:text-primary-700",
              compact ? "text-sm leading-tight lg:text-lg" : "text-lg"
            )}
          >
            {product.name}
          </Link>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm text-charcoal-light",
              compact ? "hidden lg:block" : "block"
            )}
          >
            {product.shortDesc}
          </p>
        </div>
        <div
          className={cn(
            "mt-auto flex items-baseline gap-2",
            compact && "justify-center lg:justify-start"
          )}
        >
          <span
            className={cn(
              "font-display text-charcoal",
              compact ? "text-base lg:text-lg" : "text-lg"
            )}
          >
            {formatPrice(product.price, { currency: product.currency })}
          </span>
          {onSale ? (
            <span
              className={cn(
                "text-charcoal-light line-through",
                compact ? "text-xs lg:text-sm" : "text-sm"
              )}
            >
              {formatPrice(product.compareAtPrice!, { currency: product.currency })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
