/** Brand prefix for auto-generated SKUs (e.g. PS). */
export const BRAND_SKU_PREFIX = "PS";

/**
 * Auto-generated product SKU: BRAND-XXXX-XXXX (unique, human-readable).
 * Used in admin product form, CSV import, and anywhere SKU is not entered manually.
 */
export function generateBrandSku(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${BRAND_SKU_PREFIX}-${timestamp}-${random}`;
}

/** Generate a unique product code from name (includes brand prefix). */
export function suggestProductCode(name: string, existing?: string): string {
  if (existing?.trim()) return existing.trim().toUpperCase();
  const base = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.slice(0, 4).toUpperCase())
    .join("-");
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `${BRAND_SKU_PREFIX}-${base || "ITEM"}-${suffix}`;
}

export function suggestVariantSku(productCode: string, variantName: string): string {
  const v = variantName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.slice(0, 6).toUpperCase())
    .join("-");
  return `${productCode}-${v || "DEFAULT"}`;
}
