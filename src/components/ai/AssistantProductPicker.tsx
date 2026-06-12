"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import type { AssistantProduct } from "@/lib/assistant/types";

export function AssistantProductPicker({
  product,
  onViewCart,
}: {
  product: AssistantProduct;
  onViewCart?: () => void;
}) {
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState<string | null>(
    product.variants.find((v) => v.stock > 0)?.id ??
      product.variants[0]?.id ??
      null
  );
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? null,
    [product.variants, variantId]
  );

  const price = variant?.price ?? product.price;
  const stock = variant?.stock ?? product.stock;
  const lineId = variant?.id ?? product.id;
  const displayName = variant
    ? `${product.name} — ${variant.name}`
    : product.name;
  const soldOut = stock <= 0;

  const handleAdd = () => {
    if (soldOut) return;
    add(
      {
        id: lineId,
        productId: product.id,
        variantId: variant?.id,
        variantName: variant?.name,
        productCode: product.productCode,
        variantSku: variant?.sku,
        slug: product.slug,
        name: displayName,
        price,
        currency: product.currency,
        imageUrl: variant?.imageUrl ?? product.imageUrl,
        maxStock: stock,
      },
      1,
      { openDrawer: false }
    );
    setAdded(true);
  };

  return (
    <div className="w-full min-w-0 rounded-xl border border-blush-200/80 bg-white p-3 text-charcoal shadow-sm">
      <p className="text-sm font-semibold leading-snug break-words">{product.name}</p>
      <p className="mt-0.5 text-xs text-charcoal-light">
        {formatPrice(price, { currency: product.currency })}
      </p>

      {product.variants.length > 0 ? (
        <div className="mt-2.5">
          <label
            htmlFor={`variant-${product.id}`}
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-charcoal-light"
          >
            {product.variantDimension === "inches" ? "Length" : "Option"}
          </label>
          <select
            id={`variant-${product.id}`}
            value={variantId ?? ""}
            onChange={(e) => {
              setVariantId(e.target.value || null);
              setAdded(false);
            }}
            className="h-10 w-full min-w-0 rounded-lg border border-blush-200 bg-white px-2.5 text-sm"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.name}
                {v.stock <= 0 ? " — sold out" : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className={cn(
            "flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
            added
              ? "bg-emerald-600 text-white"
              : "bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          {added ? "Added to cart" : soldOut ? "Sold out" : "Add to cart"}
        </button>

        {added ? (
          <button
            type="button"
            onClick={() => onViewCart?.()}
            className="min-h-[44px] rounded-lg border border-blush-200 px-3 py-2.5 text-sm font-semibold text-charcoal hover:bg-blush-50 sm:shrink-0"
          >
            View cart
          </button>
        ) : null}
      </div>
    </div>
  );
}
