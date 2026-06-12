import { NextRequest, NextResponse } from "next/server";
import { CouponError, validateCoupon } from "@/lib/checkout/coupon";
import { calculateTotals } from "@/lib/orders";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import type { ShippingMethod } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "coupon-validate", 20, 60_000);
  if (limited) return limited;

  let body: {
    code?: string;
    subtotal?: number;
    shippingMethod?: ShippingMethod;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim();
  const subtotal = Number(body.subtotal ?? 0);
  const shippingMethod = body.shippingMethod === "doorstep" ? "doorstep" : "pickup";

  if (!code) {
    return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
  }

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });
  }

  const preview = calculateTotals(
    [{ price: subtotal, quantity: 1, currency: "GHS" }],
    { shippingMethod }
  );

  try {
    const result = await validateCoupon(code, subtotal, preview.shipping);
    return NextResponse.json({
      valid: true,
      code: result.code,
      discount: result.discountPesewas,
      freeShipping: result.freeShipping,
    });
  } catch (err) {
    const message = err instanceof CouponError ? err.message : "Invalid coupon";
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
