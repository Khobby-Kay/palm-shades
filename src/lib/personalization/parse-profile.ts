import { EMPTY_PROFILE, type VisitorProfile } from "./types";

/** Normalize JSON from DB or API into a valid v2 profile. */
export function parseStoredProfile(json: unknown): VisitorProfile | null {
  if (!json || typeof json !== "object") return null;
  const raw = json as Partial<VisitorProfile> & { version?: number };
  if (!Array.isArray(raw.searches)) return null;

  if (raw.version !== undefined && raw.version < 2) {
    return {
      ...EMPTY_PROFILE,
      ...raw,
      version: 2,
      externalIntents: [],
      declaredInterests: [],
    };
  }

  return {
    version: 2,
    searches: raw.searches ?? [],
    views: raw.views ?? [],
    categories: raw.categories ?? {},
    cartProductIds: raw.cartProductIds ?? [],
    wishlistProductIds: raw.wishlistProductIds ?? [],
    externalIntents: raw.externalIntents ?? [],
    declaredInterests: raw.declaredInterests ?? [],
  };
}
