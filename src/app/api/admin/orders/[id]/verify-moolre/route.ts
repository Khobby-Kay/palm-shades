import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  getPaymentStatus,
  isMoolrePaymentSuccessful,
} from "@/lib/moolre";
import { markOrderPaid } from "@/lib/order-payment";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ paid: true, alreadyPaid: true });
  }

  if (order.paymentMethod !== "MOOLRE") {
    return NextResponse.json(
      { error: "This order did not use Moolre checkout." },
      { status: 400 }
    );
  }

  const status = await getPaymentStatus(order.orderNumber);
  if (!isMoolrePaymentSuccessful(status)) {
    return NextResponse.json({
      paid: false,
      txstatus: status?.txstatus ?? null,
      message:
        "Payment not confirmed yet. Ask the customer to complete Moolre checkout, or try again shortly.",
    });
  }

  await markOrderPaid(
    order.id,
    status?.transactionid ?? undefined
  );

  return NextResponse.json({
    paid: true,
    transactionId: status?.transactionid ?? null,
  });
}
