import type { CatalogProduct } from "@/lib/catalog";
import type { VisitorProfile } from "./types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function termMatchScore(blob: string, terms: string[], weight: number, decay = 1): number {
  let score = 0;
  for (const raw of terms) {
    const q = raw.toLowerCase().trim();
    if (!q) continue;
    if (blob.includes(q)) {
      score += weight * decay;
      continue;
    }
    const tokens = tokenize(q);
    const hits = tokens.filter((t) => blob.includes(t)).length;
    if (hits > 0) score += hits * (weight * 0.4) * decay;
  }
  return score;
}

function searchMatchScore(product: CatalogProduct, profile: VisitorProfile): number {
  const blob = `${product.name} ${product.shortDesc} ${product.description} ${product.categorySlug} ${product.productCode}`.toLowerCase();
  let score = 0;

  for (const { query, at } of profile.searches) {
    const ageDays = (Date.now() - at) / 86_400_000;
    const decay = Math.max(0.4, 1 - ageDays / 14);
    score += termMatchScore(blob, [query], 14, decay);
  }

  const now = Date.now();
  for (const intent of profile.externalIntents) {
    const ageDays = (now - intent.at) / 86_400_000;
    const decay = Math.max(0.5, 1 - ageDays / 21);
    score += termMatchScore(blob, intent.terms, 16, decay);
    if (intent.categoryHints.includes(product.categorySlug)) {
      score += 10 * decay;
    }
  }

  if (profile.declaredInterests.includes(product.categorySlug)) {
    score += 18;
  }

  return score;
}

export function scoreProduct(product: CatalogProduct, profile: VisitorProfile): number {
  let score = product.isFeatured ? 3 : 0;
  score += product.isBestSeller ? 1 : 0;
  score += (product.rating / 5) * 2;

  const catWeight = profile.categories[product.categorySlug] ?? 0;
  score += catWeight * 1.5;

  score += searchMatchScore(product, profile);

  const now = Date.now();
  for (const view of profile.views) {
    if (view.productId === product.id) {
      const days = (now - view.at) / 86_400_000;
      score += Math.max(0, 28 - days * 4);
    } else if (view.categorySlug === product.categorySlug) {
      score += 4;
    }
  }

  if (profile.cartProductIds.includes(product.id)) score += 35;
  if (profile.wishlistProductIds.includes(product.id)) score += 22;

  return score;
}

export function rankProductsByInterest(
  products: CatalogProduct[],
  profile: VisitorProfile,
  options?: { excludeIds?: string[]; limit?: number }
): CatalogProduct[] {
  const exclude = new Set(options?.excludeIds ?? []);
  const scored = products
    .filter((p) => !exclude.has(p.id))
    .map((p) => ({ product: p, score: scoreProduct(p, profile) }))
    .sort((a, b) => b.score - a.score);

  const limit = options?.limit ?? scored.length;
  return scored.slice(0, limit).map((s) => s.product);
}

export function personalizationHeadline(profile: VisitorProfile): string | null {
  const external = profile.externalIntents[0];
  if (external?.terms[0]) {
    const via =
      external.source === "landing"
        ? "your link"
        : external.label || external.source;
    return `Because you were looking for “${external.terms[0]}” (${via})`;
  }

  const topSearch = profile.searches[0]?.query;
  if (topSearch) {
    return `Because you searched for “${topSearch}”`;
  }

  if (profile.declaredInterests.length) {
    const label = profile.declaredInterests[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `Because you're into ${label}`;
  }

  const topCats = Object.entries(profile.categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([slug]) => slug.replace(/-/g, " "));

  if (topCats.length) {
    const label = topCats[0].replace(/\b\w/g, (c) => c.toUpperCase());
    return `Because you love ${label}`;
  }

  if (profile.views.length >= 2) {
    return "Based on what you've been browsing";
  }
  return null;
}

/** Products that strongly match off-site / declared intent terms (for “we have this” banners). */
export function productsMatchingIntent(
  products: CatalogProduct[],
  profile: VisitorProfile,
  limit = 4
): { terms: string[]; products: CatalogProduct[] } {
  const terms = [
    ...profile.searches.slice(0, 3).map((s) => s.query),
    ...profile.externalIntents.flatMap((i) => i.terms).slice(0, 5),
  ].filter((t) => t.length >= 2);

  if (!terms.length) return { terms: [], products: [] };

  const ranked = rankProductsByInterest(products, profile, { limit: 20 });
  const matched = ranked.filter((p) => scoreProduct(p, profile) >= 12).slice(0, limit);

  return { terms: [...new Set(terms)].slice(0, 3), products: matched };
}
