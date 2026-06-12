"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { CheckoutNavigateButton } from "@/components/checkout/CheckoutNavigateButton";
import { SmartImage } from "@/components/ui/SmartImage";
import { Placeholder } from "@/components/ui/Placeholder";
import { useCart, cartSelectors } from "@/store/cart";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { formatPrice } from "@/lib/utils";

const SHIPPING_THRESHOLD = 50000;

export default function CartPage() {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(cartSelectors.subtotal);
  const count = useCart(cartSelectors.count);
  const hydrated = useCart((s) => s.hasHydrated);

  const currency = items[0]?.currency ?? "GHS";
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shipping;


  if (hydrated && items.length === 0) {
    return (
      <Container className="py-24 md:py-32">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush-50 text-primary-600">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-display text-display-md text-charcoal">
            Your cart is empty
          </h1>
          <p className="mt-3 text-base text-charcoal-light">
            Browse the boutique and discover a few signature pieces to take home.
          </p>
          <LinkButton href="/shop" size="lg" variant="primary" className="mt-8">
            Start shopping
          </LinkButton>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
            Your Cart
          </p>
          <h1 className="mt-4 font-display text-display-md text-charcoal">
            Review your selection
          </h1>
          <p className="mt-3 text-base text-charcoal-light">
            {hydrated ? `${count} item${count === 1 ? "" : "s"} in your cart.` : "Loading…"}
          </p>
        </div>
        {hydrated && items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal-light hover:text-primary-700"
          >
            Clear cart
          </button>
        ) : null}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr,1fr]">
        {/* Items */}
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-5 rounded-3xl bg-white p-5 shadow-card ring-1 ring-blush-200/60"
            >
              <Link
                href={`/shop/${item.slug}`}
                className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#FAF7F2] p-2.5 ring-1 ring-blush-200/60 sm:h-32 sm:w-32 sm:p-3"
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
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-display text-lg text-charcoal hover:text-primary-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-charcoal-light">
                      {formatPrice(item.price, { currency: item.currency })} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-primary-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-blush-200 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="grid h-10 w-10 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[36px] text-center text-sm font-medium text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="grid h-10 w-10 place-items-center rounded-full text-charcoal-light hover:bg-blush-50 hover:text-charcoal"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-display text-xl text-charcoal">
                    {formatPrice(item.price * item.quantity, {
                      currency: item.currency,
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="order-first lg:order-none lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-blush-200/60 sm:rounded-3xl sm:p-7">
            <h2 className="font-display text-2xl text-charcoal">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-charcoal-light">Subtotal</dt>
                <dd className="font-medium text-charcoal">
                  {formatPrice(subtotal, { currency })}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-charcoal-light">Shipping</dt>
                <dd className="font-medium text-charcoal">
                  {shipping === 0 ? "Free" : formatPrice(shipping, { currency })}
                </dd>
              </div>
              <div className="my-3 border-t border-blush-200/60" />
              <div className="flex items-baseline justify-between">
                <dt className="text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
                  Total
                </dt>
                <dd className="font-display text-3xl text-charcoal">
                  {formatPrice(total, { currency })}
                </dd>
              </div>
            </dl>

            <div className="mt-7 hidden lg:block">
              <CheckoutNavigateButton className="w-full" size="lg" />
              <p className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
                <Lock className="h-3 w-3" />
                Secure checkout
              </p>
              <Link
                href="/shop"
                className="mt-3 block text-center text-xs uppercase tracking-[0.22em] text-charcoal-light hover:text-charcoal"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {hydrated && items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-200/90 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <CheckoutNavigateButton
            className="w-full"
            size="lg"
            label={`Checkout · ${formatPrice(total, { currency })}`}
          />
        </div>
      ) : null}
      <div className="h-24 lg:hidden" aria-hidden />
    </Container>
  );
}
