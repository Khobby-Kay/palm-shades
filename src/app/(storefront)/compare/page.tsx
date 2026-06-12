"use client";

import Link from "next/link";
import { GitCompare, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SmartImage } from "@/components/ui/SmartImage";
import { LinkButton } from "@/components/ui/Button";
import { FrameCompareButton } from "@/components/frames/FrameCompareButton";
import { useFrameCompare } from "@/store/frame-compare";
import {
  faceShapeLabels,
  getFrameMetaOrDefault,
} from "@/lib/data/frame-meta";
import { getProductImage } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";

export default function ComparePage() {
  const items = useFrameCompare((s) => s.items);
  const hydrated = useFrameCompare((s) => s.hasHydrated);
  const addToCart = useCart((s) => s.add);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <p className="text-center text-charcoal-light">Loading compare tray…</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <GitCompare className="mx-auto h-12 w-12 text-primary-400" />
          <h1 className="mt-6 font-display text-3xl text-charcoal">Compare frames</h1>
          <p className="mt-3 text-sm text-charcoal-light">
            Add up to three frames from any product page, then compare fit, lenses, and price
            side by side.
          </p>
          <LinkButton href="/shop" variant="gold" className="mt-8">
            Browse eyewear
          </LinkButton>
        </div>
      </Container>
    );
  }

  const rows = [
    { key: "Price", render: (slug: string, i: number) => formatPrice(items[i].price, { currency: items[i].currency }) },
    { key: "Rating", render: (_: string, i: number) => `${items[i].rating.toFixed(1)} ★` },
    { key: "Lens width", render: (slug: string, i: number) => `${getFrameMetaOrDefault(slug, items[i].categorySlug).lensWidthMm} mm` },
    { key: "Bridge", render: (slug: string, i: number) => `${getFrameMetaOrDefault(slug, items[i].categorySlug).bridgeMm} mm` },
    { key: "Temple", render: (slug: string, i: number) => `${getFrameMetaOrDefault(slug, items[i].categorySlug).templeMm} mm` },
    { key: "UV", render: (slug: string, i: number) => getFrameMetaOrDefault(slug, items[i].categorySlug).uvProtection },
    { key: "Polarized", render: (slug: string, i: number) => (getFrameMetaOrDefault(slug, items[i].categorySlug).polarized ? "Yes" : "No") },
    { key: "Face shapes", render: (slug: string, i: number) => getFrameMetaOrDefault(slug, items[i].categorySlug).faceShapes.map((s) => faceShapeLabels[s]).join(", ") },
    { key: "Style", render: (slug: string, i: number) => getFrameMetaOrDefault(slug, items[i].categorySlug).frameStyle.replace("-", " ") },
  ];

  return (
    <Container className="py-10 md:py-16">
      <h1 className="font-display text-3xl text-charcoal md:text-4xl">Compare frames</h1>
      <p className="mt-2 text-sm text-charcoal-light">
        Side-by-side fit and lens details — unique to Palm Shades.
      </p>

      <div className="mt-10 overflow-x-auto overscroll-x-contain scrollbar-none">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 border-b border-blush-200 pb-4 text-left text-xs uppercase tracking-wider text-charcoal-light" />
              {items.map((item) => (
                <th
                  key={item.id}
                  className="border-b border-blush-200 px-3 pb-4 text-left align-top"
                >
                  <Link href={`/shop/${item.slug}`} className="group block">
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl bg-[#FAF7F2] p-2">
                      <SmartImage
                        src={item.imageUrl ?? getProductImage(item.slug)}
                        alt={item.name}
                        fit="contain"
                        variant="ivory"
                        sizes="96px"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-charcoal group-hover:text-primary-800">
                      {item.name}
                    </p>
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                      className="inline-flex items-center gap-1 rounded-full bg-charcoal px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-charcoal-soft"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add
                    </button>
                    <FrameCompareButton item={item} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-blush-100">
                <td className="py-3 pr-4 font-medium text-charcoal-light">{row.key}</td>
                {items.map((item, i) => (
                  <td key={item.id} className="px-3 py-3 capitalize text-charcoal">
                    {row.render(item.slug, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <LinkButton href="/shop" variant="outline">
          Add more frames
        </LinkButton>
        <LinkButton href="/book" variant="gold">
          Book a fitting
        </LinkButton>
      </div>
    </Container>
  );
}
