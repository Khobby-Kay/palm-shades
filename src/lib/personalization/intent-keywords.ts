/** Maps eyewear-related words (search, ads, social captions) → shop category slugs. */
export const INTENT_KEYWORD_TO_CATEGORIES: Record<string, string[]> = {
  sunglasses: ["sunglasses"],
  shades: ["sunglasses"],
  aviator: ["sunglasses"],
  polarized: ["sunglasses"],
  sun: ["sunglasses"],
  optical: ["optical-frames"],
  frames: ["optical-frames"],
  glasses: ["optical-frames", "sunglasses"],
  prescription: ["optical-frames"],
  acetate: ["optical-frames", "luxury-collection"],
  titanium: ["optical-frames", "luxury-collection"],
  luxury: ["luxury-collection"],
  designer: ["luxury-collection", "sunglasses"],
  collector: ["luxury-collection"],
  "blue light": ["blue-light"],
  bluelight: ["blue-light"],
  screen: ["blue-light"],
  computer: ["blue-light"],
  accessories: ["accessories"],
  case: ["accessories"],
  chain: ["accessories"],
  cloth: ["accessories"],
  gift: ["gift-sets"],
  gifts: ["gift-sets"],
  "gift set": ["gift-sets"],
  corporate: ["gift-sets"],
  boutique: ["sunglasses", "optical-frames"],
  eyewear: ["sunglasses", "optical-frames"],
  lenses: ["optical-frames", "blue-light"],
  fitting: ["optical-frames"],
  accra: ["sunglasses", "optical-frames"],
  ghana: ["sunglasses", "optical-frames"],
  palm: ["sunglasses", "luxury-collection"],
};

export const SOURCE_CATEGORY_HINTS: Record<string, string[]> = {
  google: ["sunglasses", "optical-frames", "blue-light"],
  bing: ["sunglasses", "optical-frames", "blue-light"],
  duckduckgo: ["sunglasses", "optical-frames", "blue-light"],
  youtube: ["sunglasses", "luxury-collection"],
  instagram: ["sunglasses", "luxury-collection"],
  tiktok: ["sunglasses", "blue-light"],
  facebook: ["optical-frames", "gift-sets"],
  pinterest: ["sunglasses", "accessories"],
  twitter: ["luxury-collection", "sunglasses"],
  x: ["luxury-collection", "sunglasses"],
  whatsapp: ["gift-sets", "sunglasses"],
  snapchat: ["sunglasses"],
};

export function categoriesForTerms(terms: string[]): string[] {
  const scores = new Map<string, number>();
  const normalized = terms.map((t) => t.toLowerCase().trim()).filter(Boolean);

  for (const term of normalized) {
    const direct = INTENT_KEYWORD_TO_CATEGORIES[term];
    if (direct) {
      for (const slug of direct) scores.set(slug, (scores.get(slug) ?? 0) + 3);
    }
    for (const [key, slugs] of Object.entries(INTENT_KEYWORD_TO_CATEGORIES)) {
      if (term.includes(key) || key.includes(term)) {
        for (const slug of slugs) scores.set(slug, (scores.get(slug) ?? 0) + 2);
      }
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);
}

export function tokenizeIntentText(text: string): string[] {
  const lower = text.toLowerCase().trim();
  const phrases = Object.keys(INTENT_KEYWORD_TO_CATEGORIES)
    .filter((k) => k.includes(" ") && lower.includes(k))
    .sort((a, b) => b.length - a.length);

  const tokens = lower
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  return [...new Set([...phrases, ...tokens])];
}
