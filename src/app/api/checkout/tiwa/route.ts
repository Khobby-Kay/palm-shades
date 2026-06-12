import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  isTiwaCheckoutPayload,
  processTiwaCheckout,
} from "@/lib/tiwa/process-checkout";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "checkout-tiwa", 10, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isTiwaCheckoutPayload(body)) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const result = await processTiwaCheckout(body, new URL(req.url).origin);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, fieldErrors: result.fieldErrors },
      { status: result.status }
    );
  }

  return NextResponse.json({
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    redirectUrl: result.redirectUrl,
  });
}
