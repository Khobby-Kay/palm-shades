"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductActions({
  product,
  imageUrl,
}: {
  product: CatalogProduct;
  imageUrl?: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId]
  );

  const price = selectedVariant?.price ?? product.price;
  const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const stock = selectedVariant?.stock ?? product.stock;
  const displayImage = selectedVariant?.imageUrl ?? imageUrl;
  const lineId = selectedVariant?.id ?? product.id;
  const displayName = selectedVariant
    ? `${product.name} — ${selectedVariant.name}`
    : product.name;

  const add = useCart((s) => s.add);
  const closeCart = useCart((s) => s.close);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.has(product.id));
  const wishlistHydrated = useWishlist((s) => s.hasHydrated);

  const max = Math.max(1, stock);
  const isSoldOut = stock === 0;

  const cartPayload = {
    id: lineId,
    productId: product.id,
    variantId: selectedVariant?.id,
    variantName: selectedVariant?.name,
    productCode: product.productCode,
    variantSku: selectedVariant?.sku,
    slug: product.slug,
    name: displayName,
    price,
    currency: product.currency,
    imageUrl: displayImage,
    maxStock: stock,
  };

  const handleAdd = () => {
    add(cartPayload, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(cartPayload, qty);
    closeCart();
    router.prefetch("/checkout");
    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      <p className="font-mono text-xs text-charcoal-light">
        {product.productCode}
        {selectedVariant ? ` · ${selectedVariant.sku}` : ""}
      </p>

      {product.variants.length > 0 ? (
        <div>
          <span className="text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
            {product.variantDimension === "inches"
              ? "Choose length"
              : product.variants.some((v) => /\d+\s*"/.test(v.name))
                ? "Choose length"
                : "Choose option"}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock === 0}
                onClick={() => {
                  setSelectedVariantId(v.id);
                  setQty(1);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  selectedVariantId === v.id
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-blush-200 bg-white text-charcoal hover:border-primary-300",
                  v.stock === 0 && "cursor-not-allowed opacity-40"
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
          Quantity
        </span>
        <div className="inline-flex items-center rounded-full border border-blush-200 bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || isSoldOut}
            aria-label="Decrease quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[40px] text-center text-sm font-medium text-charcoal">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max || isSoldOut}
            aria-label="Increase quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-charcoal-light">
          {isSoldOut
            ? "Sold out"
            : stock < 10
              ? `Only ${stock} left`
              : "In stock"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.4fr,1fr]">
        <Button
          size="lg"
          variant="primary"
          onClick={handleAdd}
          disabled={isSoldOut}
          className="w-full"
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {isSoldOut ? "Sold out" : "Add to cart"}
            </>
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="dark"
          onClick={handleBuyNow}
          disabled={isSoldOut}
          className="w-full"
        >
          Buy now
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <button
        type="button"
        onClick={() =>
          toggleWish({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price,
            currency: product.currency,
            imageUrl: displayImage,
          })
        }
        className={cn(
          "inline-flex items-center gap-2 text-sm transition-colors",
          wishlistHydrated && wished
            ? "text-primary-700"
            : "text-charcoal-light hover:text-primary-700"
        )}
      >
        <Heart className={cn("h-4 w-4", wishlistHydrated && wished ? "fill-current" : "")} />
        {wishlistHydrated && wished ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    </div>
  );
}
