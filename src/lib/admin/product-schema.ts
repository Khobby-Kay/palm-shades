import { z } from "zod";

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  priceGhs: z.number().positive().optional().nullable(),
  compareAtPriceGhs: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  productCode: z.string().trim().min(2, "Product code must be at least 2 characters"),
  slug: z.string().optional(),
  shortDesc: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priceGhs: z.coerce.number().positive("Price must be greater than zero"),
  compareAtPriceGhs: z
    .union([z.null(), z.literal(""), z.coerce.number().positive()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
});

export type ProductWriteInput = z.infer<typeof productWriteSchema>;

export function toMinorUnits(ghs: number): number {
  return Math.round(ghs * 100);
}

export function formatProductValidationError(details: {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}): string {
  const fieldMsgs = Object.entries(details.fieldErrors)
    .flatMap(([field, msgs]) => (msgs ?? []).map((m) => `${field}: ${m}`));
  const all = [...fieldMsgs, ...details.formErrors];
  return all.length > 0 ? all.join(" · ") : "Validation failed";
}
