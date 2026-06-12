import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const service = await prisma.service.upsert({
    where: { slug: "hair-wash-blowout" },
    create: {
      slug: "hair-wash-blowout",
      name: "Wash & Blowout",
      shortDesc: "test",
      description: "test",
      durationMin: 60,
      price: 18000,
      currency: "GHS",
    },
    update: {},
  });

  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      date: new Date("2026-05-24T00:00:00"),
      startTime: "10:00",
      location: "IN_SALON",
      status: "PENDING",
      guestName: "Test User",
      guestEmail: "test@example.com",
      guestPhone: "+233240000000",
    },
  });

  console.log(JSON.stringify({ ok: true, bookingId: booking.id }));
  await prisma.booking.delete({ where: { id: booking.id } });
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
