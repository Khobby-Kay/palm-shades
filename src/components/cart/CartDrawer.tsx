"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, cartSelectors } from "@/store/cart";
import { Placeholder } from "@/components/ui/Placeholder";
import { SmartImage } from "@/components/ui/SmartImage";
import { LinkButton } from "@/components/ui/Button";
import { CheckoutNavigateButton } from "@/components/checkout/CheckoutNavigateButton";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { formatPrice, cn } from "@/lib/utils";

const SHIPPING_THRESHOLD = 50000; // GHS 500

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(cartSelectors.subtotal);
  const count = useCart(cartSelectors.count);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);


  const currency = items[0]?.currency ?? "GHS";
  const shippingRemaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-luxe transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-blush-200/70 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-50 text-primary-700">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-xl text-charcoal">Your Cart</p>
              <p className="text-xs text-charcoal-light">
                {count === 0 ? "Empty" : `${count} item${count > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Free shipping progress */}
        {items.length > 0 ? (
          <div className="border-b border-blush-200/70 bg-blush-50/60 px-6 py-4">
            {shippingRemaining > 0 ? (
              <p className="text-xs text-charcoal-light">
                Add{" "}
                <span className="font-medium text-charcoal">
                  {formatPrice(shippingRemaining, { currency })}
                </span>{" "}
                more for <span className="font-medium text-primary-700">complimentary delivery</span>.
              </p>
            ) : (
              <p className="text-xs font-medium text-primary-700">
                You&rsquo;ve unlocked complimentary delivery.
              </p>
            )}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <EmptyState onClose={close} />
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={close}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#FAF7F2] p-2 ring-1 ring-blush-200/60"
                  >
                    {item.imageUrl ? (
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        variant="ivory"
                        fit="contain"
                        sizes={IMAGE_SIZES.cartThumb}
                      />
                    ) : (
                      <Placeholder variant="gold" className="h-full w-full" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={close}
                        className="font-display text-base leading-tight text-charcoal hover:text-primary-700"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="grid h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-primary-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-blush-200 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-medium text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-display text-base text-charcoal">
                        {formatPrice(item.price * item.quantity, {
                          currency: item.currency,
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 ? (
          <footer className="border-t border-blush-200/70 bg-white px-6 py-5">
            <div className="mb-1 flex items-center justify-between text-sm text-charcoal-light">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, { currency })}</span>
            </div>
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.22em] text-charcoal-light">
                Estimated total
              </span>
              <span className="font-display text-2xl text-charcoal">
                {formatPrice(subtotal, { currency })}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <CheckoutNavigateButton className="w-full" size="lg" />
              <LinkButton
                href="/cart"
                size="sm"
                variant="ghost"
                className="w-full"
              >
                View cart
              </LinkButton>
              <button
                type="button"
                onClick={close}
                className="text-xs uppercase tracking-[0.22em] text-charcoal-light hover:text-charcoal"
              >
                Continue browsing
              </button>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-blush-50 text-primary-600">
        <ShoppingBag className="h-7 w-7" />
      </span>
      <h3 className="mt-6 font-display text-2xl text-charcoal">
        Your cart is quiet
      </h3>
      <p className="mt-2 max-w-xs text-sm text-charcoal-light">
        Explore curated sunglasses, optical frames, and accessories crafted for
        those who see luxury clearly.
      </p>
      <LinkButton
        href="/shop"
        size="md"
        variant="primary"
        className="mt-7"
      >
        Shop eyewear
      </LinkButton>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-xs uppercase tracking-[0.22em] text-charcoal-light hover:text-charcoal"
      >
        Close
      </button>
    </div>
  );
}
