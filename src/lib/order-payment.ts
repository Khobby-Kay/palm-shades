import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/notifications/customer";
import { syncOrderPaymentToSupabase } from "@/lib/sync/order-to-supabase";

/** Mark order paid and send confirmation emails + SMS (idempotent). */
export async function markOrderPaid(orderId: string, moolreReference?: string) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  if (!existing || existing.paymentStatus === "PAID") {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "PROCESSING",
      ...(moolreReference ? { moolreReference } : {}),
    },
    include: { items: true },
  });

  void syncOrderPaymentToSupabase(order.id, "PAID", "PROCESSING").catch((e) =>
    console.error("[sync] order payment:", e)
  );

  notifyOrderPaid({
    orderNumber: order.orderNumber,
    fullName: order.fullName,
    email: order.email,
    phone: order.phone,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentStatus: "PAID",
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingRegion: order.shippingRegion,
    shippingCountry: order.shippingCountry,
    items: order.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      price: it.price,
    })),
  });

  return order;
}
