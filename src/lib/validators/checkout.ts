import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/types/enums";

export const cartItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1).optional(),
  variantId: z.string().optional().nullable(),
  variantName: z.string().optional().nullable(),
  productCode: z.string().optional().nullable(),
  variantSku: z.string().optional().nullable(),
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  currency: z.string().default("GHS"),
  imageUrl: z.string().optional().nullable(),
  quantity: z.number().int().positive(),
});

export const SHIPPING_METHODS = ["pickup", "doorstep"] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const checkoutSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().optional().nullable(),
    email: z.string().trim().email("Please enter a valid email"),
    phone: z.string().trim().min(7, "Please enter a valid phone number"),
    shippingMethod: z.enum(SHIPPING_METHODS).default("pickup"),
    shippingLine1: z.string().trim().optional().nullable(),
    shippingLine2: z.string().trim().optional().nullable(),
    shippingCity: z.string().trim().optional().nullable(),
    shippingRegion: z.string().trim().optional().nullable(),
    shippingCountry: z.string().trim().min(2).default("Ghana"),
    notes: z.string().trim().optional().nullable(),
    couponCode: z.string().trim().optional().nullable(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    items: z.array(cartItemSchema).min(1, "Your cart is empty"),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "doorstep") {
      if (!data.shippingLine1 || data.shippingLine1.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Street address is required for delivery",
          path: ["shippingLine1"],
        });
      }
      if (!data.shippingCity || data.shippingCity.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required for delivery",
          path: ["shippingCity"],
        });
      }
      if (!data.shippingRegion || data.shippingRegion.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Region is required for delivery",
          path: ["shippingRegion"],
        });
      }
    }

    if (
      (data.paymentMethod === "MOOLRE" || data.paymentMethod === "MOBILE_MONEY") &&
      !data.phone?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for Mobile Money",
        path: ["phone"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;

/** Legacy full-name helper for Prisma rows. */
export function checkoutFullName(input: {
  firstName: string;
  lastName?: string | null;
}): string {
  return `${input.firstName.trim()} ${(input.lastName ?? "").trim()}`.trim();
}
