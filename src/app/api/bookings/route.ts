import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators/booking";
import { services } from "@/lib/data/services";
import { calculateBookingPrice } from "@/lib/booking/price";
import { notifyBookingConfirmed } from "@/lib/notifications/booking";
import { bookingSuccessPath } from "@/lib/security/order-access";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "bookings", 6, 60_000);
  if (limited) return limited;

  try {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const session = await auth();
  let userId: string | null = session?.user?.id ?? null;
  if (userId) {
    const exists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) userId = null;
  }

  // Resolve the service (from local catalog or DB).
  const local = services.find((s) => s.slug === input.serviceSlug);
  const dbService = await prisma.service
    .findUnique({ where: { slug: input.serviceSlug } })
    .catch(() => null);
  const service = dbService ?? local;
  if (!service) {
    return NextResponse.json(
      { error: "That service could not be found." },
      { status: 404 }
    );
  }

  // Optional: create or reuse a child profile if user provided child info AND a name.
  // (We don't tie this to a user yet — Phase 5 will add ownership.)
  let childId: string | null = null;
  if (input.childName && input.childName.trim().length > 0) {
    // For guest bookings we just store the child name inline (childId stays null).
    childId = null;
  }

  const date = new Date(`${input.date}T00:00:00`);

  // Ensure we have a Service row in the DB (so the foreign key resolves).
  let serviceId = (dbService as { id?: string } | null)?.id;
  if (!serviceId) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      create: {
        slug: service.slug,
        name: service.name,
        shortDesc: service.shortDesc,
        description: service.description,
        durationMin: service.durationMin,
        price: service.price,
        currency: service.currency,
        ageRange: service.ageRange,
        preparation: service.preparation,
        isFeatured: !!(service as { isFeatured?: boolean }).isFeatured,
      },
      update: {},
    });
    serviceId = created.id;
  }

  const bookingTotal = calculateBookingPrice(service.price, input.location);

  const booking = await prisma.booking.create({
    data: {
      userId,
      serviceId,
      childId,
      date,
      startTime: input.startTime,
      location: input.location,
      address: input.location === "HOME_SERVICE" ? input.address ?? null : null,
      notes:
        [input.notes, input.childNotes ? `Child notes: ${input.childNotes}` : null]
          .filter(Boolean)
          .join(" · ") || null,
      status: "PENDING",
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
    },
    select: { id: true },
  });

  // Fire-and-forget email + SMS — never block the user.
  void notifyBookingConfirmed({
    bookingId: booking.id,
    serviceName: service.name,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    date,
    startTime: input.startTime,
    durationMin: service.durationMin,
    location: input.location,
    address: input.location === "HOME_SERVICE" ? input.address : null,
    childName: input.childName,
    notes: input.notes,
    totalMinor: bookingTotal,
    currency: service.currency,
  });

  return NextResponse.json({
    bookingId: booking.id,
    redirectUrl: bookingSuccessPath(booking.id, input.guestEmail),
  });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    const isDb =
      message.includes("Prisma") ||
      message.includes("connect") ||
      message.includes("DATABASE");
    return NextResponse.json(
      {
        error: isDb
          ? "Our booking system is temporarily unavailable. Please call or WhatsApp us to book."
          : "Booking could not be saved. Please try again.",
      },
      { status: 500 }
    );
  }
}
