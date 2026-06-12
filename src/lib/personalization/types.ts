export type PersonalizationSearch = {
  query: string;
  at: number;
};

export type PersonalizationView = {
  productId: string;
  slug: string;
  categorySlug: string;
  at: number;
};

/** Intent from referrer, ads, social links, or campaign URLs (not other apps directly). */
export type ExternalIntent = {
  source: string;
  /** Human label e.g. google, instagram, your link */
  label: string;
  terms: string[];
  categoryHints: string[];
  at: number;
};

export type VisitorProfile = {
  version: 2;
  searches: PersonalizationSearch[];
  views: PersonalizationView[];
  categories: Record<string, number>;
  cartProductIds: string[];
  wishlistProductIds: string[];
  externalIntents: ExternalIntent[];
  /** User-selected category slugs (interest picker) */
  declaredInterests: string[];
};

export const EMPTY_PROFILE: VisitorProfile = {
  version: 2,
  searches: [],
  views: [],
  categories: {},
  cartProductIds: [],
  wishlistProductIds: [],
  externalIntents: [],
  declaredInterests: [],
};
