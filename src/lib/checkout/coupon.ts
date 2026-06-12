import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { minorToMajor } from "@/lib/sync/money";

export type CouponResult = {
  code: string;
  discountPesewas: number;
  freeShipping: boolean;
  couponId: string;
};

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  minimum_purchase: number | null;
  maximum_discount: number | null;
  usage_limit: number | null;
  usage_count: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
};

/** Validate a coupon against cart subtotal (pesewas). Returns discount in pesewas. */
export async function validateCoupon(
  code: string,
  subtotalPesewas: number,
  shippingPesewas: number
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    throw new CouponError("Enter a coupon code.");
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select(
      "id, code, type, value, minimum_purchase, maximum_discount, usage_limit, usage_count, start_date, end_date, is_active"
    )
    .eq("code", normalized)
    .maybeSingle();

  if (error) {
    console.error("[coupon] lookup:", error.message);
    throw new CouponError("Could not validate coupon. Try again.");
  }

  if (!data) {
    throw new CouponError("Invalid coupon code.");
  }

  const coupon = data as CouponRow;
  const now = new Date();

  if (!coupon.is_active) {
    throw new CouponError("This coupon is no longer active.");
  }

  if (coupon.start_date && new Date(coupon.start_date) > now) {
    throw new CouponError("This coupon is not active yet.");
  }

  if (coupon.end_date && new Date(coupon.end_date) < now) {
    throw new CouponError("This coupon has expired.");
  }

  if (
    coupon.usage_limit != null &&
    (coupon.usage_count ?? 0) >= coupon.usage_limit
  ) {
    throw new CouponError("This coupon has reached its usage limit.");
  }

  const subtotalMajor = minorToMajor(subtotalPesewas);
  const minPurchase = Number(coupon.minimum_purchase ?? 0);
  if (minPurchase > 0 && subtotalMajor < minPurchase) {
    throw new CouponError(
      `Minimum purchase of GH₵${minPurchase.toFixed(2)} required for this coupon.`
    );
  }

  const type = String(coupon.type).toLowerCase();
  let discountPesewas = 0;
  let freeShipping = false;

  if (type === "free_shipping") {
    freeShipping = true;
    discountPesewas = shippingPesewas;
  } else if (type === "percentage") {
    const pct = Number(coupon.value);
    let discountMajor = (subtotalMajor * pct) / 100;
    const maxDiscount = coupon.maximum_discount;
    if (maxDiscount != null && discountMajor > Number(maxDiscount)) {
      discountMajor = Number(maxDiscount);
    }
    discountPesewas = Math.round(discountMajor * 100);
  } else if (type === "fixed_amount") {
    discountPesewas = Math.round(Number(coupon.value) * 100);
  } else {
    throw new CouponError("Unsupported coupon type.");
  }

  discountPesewas = Math.min(discountPesewas, subtotalPesewas + shippingPesewas);

  if (discountPesewas <= 0 && !freeShipping) {
    throw new CouponError("This coupon does not apply to your order.");
  }

  return {
    code: coupon.code,
    discountPesewas,
    freeShipping,
    couponId: coupon.id,
  };
}
