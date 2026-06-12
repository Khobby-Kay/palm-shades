"use client";

import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { Placeholder } from "@/components/ui/Placeholder";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);
  const hydrated = useWishlist((s) => s.hasHydrated);
  const addToCart = useCart((s) => s.add);

  if (hydrated && items.length === 0) {
    return (
      <Container className="py-24 md:py-32">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush-50 text-primary-600">
            <Heart className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-display text-display-md text-charcoal">
            Your wishlist is empty
          </h1>
          <p className="mt-3 text-base text-charcoal-light">
            Save your favorite essentials here and bring them home when you&rsquo;re ready.
          </p>
          <LinkButton href="/shop" size="lg" variant="primary" className="mt-8">
            Browse the boutique
            <ArrowUpRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
            Saved For Later
          </p>
          <h1 className="mt-4 font-display text-display-md text-charcoal">
            Your wishlist
          </h1>
          <p className="mt-3 max-w-xl text-base text-charcoal-light">
            {hydrated
              ? `You have ${items.length} item${items.length === 1 ? "" : "s"} saved.`
              : "Loading…"}
          </p>
        </div>
        {hydrated && items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal-light hover:text-primary-700"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-blush-200/60 transition-all hover:-translate-y-1 hover:shadow-luxe"
          >
            <Link
              href={`/shop/${item.slug}`}
              className="relative block aspect-square overflow-hidden bg-[#FAF7F2] p-3 sm:p-4"
            >
              {item.imageUrl ? (
                <SmartImage
                  src={item.imageUrl}
                  alt={item.name}
                  variant="ivory"
                  fit="contain"
                  className="transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes={IMAGE_SIZES.productGrid}
                />
              ) : (
                <Placeholder variant="gold" className="h-full w-full" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  remove(item.id);
                }}
                aria-label={`Remove ${item.name}`}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-charcoal-light shadow-soft backdrop-blur transition-colors hover:bg-white hover:text-primary-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <Link
                href={`/shop/${item.slug}`}
                className="font-display text-lg text-charcoal hover:text-primary-700"
              >
                {item.name}
              </Link>
              <p className="mt-auto font-display text-lg text-charcoal">
                {formatPrice(item.price, { currency: item.currency })}
              </p>
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    id: item.id,
                    productId: item.id,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    currency: item.currency,
                    imageUrl: item.imageUrl,
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-charcoal-soft"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
