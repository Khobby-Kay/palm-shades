import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/tiwa/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET — list boutique bookings (Prisma). */
export async function GET(request: Request) {
  const auth = await verifyAuth(request, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      service: {
        select: {
          name: true,
          slug: true,
          durationMin: true,
          price: true,
          currency: true,
        },
      },
      child: { select: { name: true } },
    },
  });

  return NextResponse.json({ bookings });
}
