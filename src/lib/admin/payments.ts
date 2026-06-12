import { prisma } from "@/lib/prisma";
import { prismaSequential } from "@/lib/prisma-sequential";
import { getMoolreSetupStatus, isMoolreConfigured } from "@/lib/moolre";
import { isStripeConfigured } from "@/lib/stripe";

export async function getPaymentOverview() {
  const [paidAgg, pendingMoolre, todayPaid] = await prismaSequential([
    () =>
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
    () =>
      prisma.order.count({
        where: {
          paymentMethod: "MOOLRE",
          paymentStatus: "PENDING",
          status: { not: "CANCELLED" },
        },
      }),
    () =>
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { total: true },
        _count: true,
      }),
  ]);

  return {
    moolre: getMoolreSetupStatus(),
    moolreEnabled: isMoolreConfigured(),
    stripeEnabled: isStripeConfigured(),
    totalRevenuePesewas: paidAgg._sum.total ?? 0,
    paidOrderCount: paidAgg._count,
    pendingMoolreCount: pendingMoolre,
    todayRevenuePesewas: todayPaid._sum.total ?? 0,
    todayPaidCount: todayPaid._count,
  };
}
