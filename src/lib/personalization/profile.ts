import { captureSessionExternalIntents } from "./parse-external-intent";
import { parseStoredProfile } from "./parse-profile";
import {
  EMPTY_PROFILE,
  type ExternalIntent,
  type PersonalizationView,
  type VisitorProfile,
} from "./types";

const STORAGE_KEY = "motchis-visitor-profile";
const SESSION_CAPTURE_KEY = "motchis-external-intent-captured";
const MAX_SEARCHES = 24;
const MAX_VIEWS = 40;
const MAX_EXTERNAL = 20;

function trimProfile(p: VisitorProfile): VisitorProfile {
  return {
    ...p,
    searches: p.searches.slice(0, MAX_SEARCHES),
    views: p.views.slice(0, MAX_VIEWS),
    externalIntents: p.externalIntents.slice(0, MAX_EXTERNAL),
    declaredInterests: [...new Set(p.declaredInterests)].slice(0, 8),
    cartProductIds: [...new Set(p.cartProductIds)].slice(0, 20),
    wishlistProductIds: [...new Set(p.wishlistProductIds)].slice(0, 30),
  };
}

export function getVisitorProfile(): VisitorProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    return trimProfile(parseStoredProfile(JSON.parse(raw)) ?? EMPTY_PROFILE);
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveVisitorProfile(profile: VisitorProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimProfile(profile)));
    window.dispatchEvent(new CustomEvent("motchis-personalization-updated"));
  } catch {
    /* quota or private mode */
  }
}

function mutate(fn: (p: VisitorProfile) => VisitorProfile): void {
  saveVisitorProfile(fn(getVisitorProfile()));
}

export function recordSearch(query: string): void {
  const q = query.trim();
  if (q.length < 2) return;
  const at = Date.now();
  mutate((p) => {
    const searches = [
      { query: q, at },
      ...p.searches.filter((s) => s.query.toLowerCase() !== q.toLowerCase()),
    ].slice(0, MAX_SEARCHES);
    return { ...p, searches };
  });
}

export function recordExternalIntents(intents: ExternalIntent[]): void {
  if (!intents.length) return;
  mutate((p) => {
    const categories = { ...p.categories };
    let searches = [...p.searches];

    for (const intent of intents) {
      for (const slug of intent.categoryHints) {
        categories[slug] = (categories[slug] ?? 0) + 4;
      }
      for (const term of intent.terms) {
        if (term.length < 3) continue;
        const exists = searches.some(
          (s) => s.query.toLowerCase() === term.toLowerCase()
        );
        if (!exists) {
          searches = [{ query: term, at: intent.at }, ...searches].slice(
            0,
            MAX_SEARCHES
          );
        }
      }
    }

    const externalIntents = [...intents, ...p.externalIntents]
      .filter(
        (item, i, arr) =>
          arr.findIndex(
            (x) =>
              x.source === item.source && x.terms.join() === item.terms.join()
          ) === i
      )
      .slice(0, MAX_EXTERNAL);

    return { ...p, categories, searches, externalIntents };
  });
}

export function captureExternalIntentOncePerSession(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SESSION_CAPTURE_KEY)) return;
    const intents = captureSessionExternalIntents();
    if (intents.length) recordExternalIntents(intents);
    sessionStorage.setItem(SESSION_CAPTURE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function recordDeclaredInterests(categorySlugs: string[]): void {
  const slugs = [...new Set(categorySlugs.filter(Boolean))];
  if (!slugs.length) return;
  mutate((p) => {
    const categories = { ...p.categories };
    for (const slug of slugs) {
      categories[slug] = (categories[slug] ?? 0) + 5;
    }
    return {
      ...p,
      declaredInterests: slugs,
      categories,
    };
  });
}

export function recordProductView(input: {
  productId: string;
  slug: string;
  categorySlug: string;
}): void {
  const at = Date.now();
  mutate((p) => {
    const views: PersonalizationView[] = [
      { ...input, at },
      ...p.views.filter((v) => v.productId !== input.productId),
    ].slice(0, MAX_VIEWS);

    const categories = { ...p.categories };
    categories[input.categorySlug] = (categories[input.categorySlug] ?? 0) + 3;

    return { ...p, views, categories };
  });
}

export function recordCategoryInterest(categorySlug: string): void {
  if (!categorySlug) return;
  mutate((p) => {
    const categories = { ...p.categories };
    categories[categorySlug] = (categories[categorySlug] ?? 0) + 2;
    return { ...p, categories };
  });
}

export function recordCartProduct(productId: string): void {
  if (!productId) return;
  mutate((p) => ({
    ...p,
    cartProductIds: [
      productId,
      ...p.cartProductIds.filter((id) => id !== productId),
    ].slice(0, 20),
  }));
}

export function syncWishlistProductIds(ids: string[]): void {
  mutate((p) => ({ ...p, wishlistProductIds: ids.slice(0, 30) }));
}

export function syncCartProductIds(ids: string[]): void {
  mutate((p) => ({ ...p, cartProductIds: ids.slice(0, 20) }));
}

export function getTopSearchTerms(limit = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const p = getVisitorProfile();

  for (const s of p.searches) {
    const key = s.query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s.query);
    if (out.length >= limit) return out;
  }

  for (const intent of p.externalIntents) {
    for (const term of intent.terms) {
      const key = term.toLowerCase();
      if (seen.has(key) || key.length < 3) continue;
      seen.add(key);
      out.push(term);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function getTopCategorySlugs(limit = 3): string[] {
  const entries = Object.entries(getVisitorProfile().categories);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, limit).map(([slug]) => slug);
}

export function getActiveIntentTerms(): string[] {
  const p = getVisitorProfile();
  const terms = [
    ...p.searches.map((s) => s.query),
    ...p.externalIntents.flatMap((i) => i.terms),
    ...p.declaredInterests,
  ];
  return [...new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 2))];
}

export function hasPersonalizationSignals(): boolean {
  const p = getVisitorProfile();
  return (
    p.searches.length > 0 ||
    p.views.length > 0 ||
    Object.keys(p.categories).length > 0 ||
    p.cartProductIds.length > 0 ||
    p.wishlistProductIds.length > 0 ||
    p.externalIntents.length > 0 ||
    p.declaredInterests.length > 0
  );
}
