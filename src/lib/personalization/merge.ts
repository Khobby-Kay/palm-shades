import type { VisitorProfile } from "./types";

function mergeCategoryMaps(
  a: Record<string, number>,
  b: Record<string, number>
): Record<string, number> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = Math.max(out[k] ?? 0, v);
  }
  return out;
}

/** Merge local + server profiles (logged-in cross-device). */
export function mergeVisitorProfiles(
  local: VisitorProfile,
  remote: VisitorProfile
): VisitorProfile {
  const searches = [...remote.searches, ...local.searches]
    .sort((a, b) => b.at - a.at)
    .filter(
      (s, i, arr) =>
        arr.findIndex((x) => x.query.toLowerCase() === s.query.toLowerCase()) === i
    )
    .slice(0, 24);

  const views = [...remote.views, ...local.views]
    .sort((a, b) => b.at - a.at)
    .filter((v, i, arr) => arr.findIndex((x) => x.productId === v.productId) === i)
    .slice(0, 40);

  const externalIntents = [...remote.externalIntents, ...local.externalIntents]
    .sort((a, b) => b.at - a.at)
    .slice(0, 20);

  const declaredInterests = [
    ...new Set([...remote.declaredInterests, ...local.declaredInterests]),
  ];

  return {
    version: 2,
    searches,
    views,
    categories: mergeCategoryMaps(remote.categories, local.categories),
    cartProductIds: [
      ...new Set([...remote.cartProductIds, ...local.cartProductIds]),
    ].slice(0, 20),
    wishlistProductIds: [
      ...new Set([...remote.wishlistProductIds, ...local.wishlistProductIds]),
    ].slice(0, 30),
    externalIntents,
    declaredInterests,
  };
}
