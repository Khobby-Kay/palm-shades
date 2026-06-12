import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/order-payment";
import {
  getPaymentStatus,
  isMoolrePaymentSuccessful,
  toMoolreAmount,
} from "@/lib/moolre";

export const dynamic = "force-dynamic";

type MoolreWebhookPayload = {
  status?: number;
  code?: string;
  message?: string;
  data?: {
    externalref?: string;
    transactionid?: string;
    amount?: string;
    metadata?: { orderId?: string; orderNumber?: string };
  };
};

function verifyWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.MOOLRE_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const provided =
    req.headers.get("x-moolre-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === secret;
}

/**
 * Moolre payment callback (server-to-server).
 * Set MOOLRE_CALLBACK_URL to https://your-domain.com/api/webhooks/moolre
 */
export async function POST(req: NextRequest) {
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MoolreWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.status !== 1) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const externalref =
    payload.data?.externalref ?? payload.data?.metadata?.orderNumber ?? null;
  const orderId = payload.data?.metadata?.orderId ?? null;

  let order =
    orderId != null
      ? await prisma.order.findUnique({ where: { id: orderId } })
      : null;

  if (!order && externalref) {
    order = await prisma.order.findUnique({
      where: { orderNumber: externalref },
    });
  }

  if (!order) {
    console.warn("Moolre webhook: order not found", payload);
    return NextResponse.json({ received: true, matched: false });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ received: true, orderId: order.id, alreadyPaid: true });
  }

  // Never trust the callback alone — confirm with Moolre API.
  const status = await getPaymentStatus(order.orderNumber);
  if (!isMoolrePaymentSuccessful(status)) {
    console.warn("Moolre webhook: payment not verified", order.orderNumber);
    return NextResponse.json({ received: true, verified: false });
  }

  if (status?.amount) {
    const expected = toMoolreAmount(order.total);
    const received = parseFloat(status.amount).toFixed(2);
    if (received !== expected) {
      console.warn("Moolre webhook: amount mismatch", {
        orderNumber: order.orderNumber,
        expected,
        received,
      });
      return NextResponse.json({ received: true, verified: false, reason: "amount_mismatch" });
    }
  }

  await markOrderPaid(
    order.id,
    status?.transactionid ?? payload.data?.transactionid ?? order.moolreReference ?? undefined
  );

  return NextResponse.json({ received: true, orderId: order.id, verified: true });
}
