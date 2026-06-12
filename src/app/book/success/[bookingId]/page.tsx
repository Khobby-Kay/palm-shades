import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Home,
  Sparkles,
  Mail,
  Phone,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { calculateBookingPrice } from "@/lib/booking/price";
import { verifyBookingAccessToken } from "@/lib/security/order-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your appointment has been received.",
};

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { bookingId: string };
  searchParams: { token?: string };
}) {
  const session = await auth();

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { service: true },
  });
  if (!booking) notFound();

  const allowed =
    (session?.user?.id && booking.userId === session.user.id) ||
    (booking.guestEmail &&
      verifyBookingAccessToken(booking.id, booking.guestEmail, searchParams.token));

  if (!allowed) notFound();

  const dateStr = booking.date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const bookingTotal = calculateBookingPrice(
    booking.service.price,
    booking.location
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-blush-200/60 bg-gradient-luxe">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-blush" />
        <Container className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-600 text-white shadow-[0_18px_40px_-18px_rgba(217,112,112,0.5)]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
              Your fitting is reserved
            </p>
            <h1 className="mt-4 font-display text-display-lg text-charcoal">
              See you soon, {booking.guestName?.split(" ")[0] ?? "friend"}.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-charcoal-light md:text-lg">
              We&rsquo;ve sent a confirmation email and SMS to{" "}
              <strong className="font-medium text-charcoal">{booking.guestEmail}</strong>
              {booking.guestPhone ? (
                <>
                  {" "}
                  and{" "}
                  <strong className="font-medium text-charcoal">{booking.guestPhone}</strong>
                </>
              ) : null}
              . A team member will reach out within one business day to confirm
              the final time and answer any questions.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/services" variant="primary" size="lg">
                Browse more services
              </LinkButton>
              <LinkButton href="/" variant="outline" size="lg">
                Back to home
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Details */}
      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-card ring-1 ring-blush-200/60 md:p-12">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
                  {booking.service.isFeatured ? "Signature ritual" : "Booked service"}
                </p>
                <h2 className="mt-2 font-display text-3xl text-charcoal">
                  {booking.service.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-charcoal-light">
                  From
                </p>
                <p className="font-display text-2xl text-charcoal">
                  {formatPrice(bookingTotal, {
                    currency: booking.service.currency,
                  })}
                </p>
                {booking.location === "HOME_SERVICE" ? (
                  <p className="mt-1 text-xs text-charcoal-light">Home service (2× boutique rate)</p>
                ) : null}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-charcoal-light">
              {booking.service.shortDesc}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <DetailRow
                Icon={Calendar}
                label="Date"
                value={dateStr}
              />
              <DetailRow
                Icon={Clock}
                label="Time"
                value={`${booking.startTime} · ${booking.service.durationMin} min`}
              />
              <DetailRow
                Icon={booking.location === "HOME_SERVICE" ? Home : MapPin}
                label="Location"
                value={
                  booking.location === "HOME_SERVICE"
                    ? `Home service${booking.address ? ` · ${booking.address}` : ""}`
                    : "In-boutique · Pantang–Abokobi studio"
                }
              />
              <DetailRow
                Icon={Sparkles}
                label="Booking ref"
                value={booking.id.slice(0, 10).toUpperCase()}
              />
            </div>

            {booking.notes ? (
              <div className="mt-6 rounded-2xl bg-blush-50/70 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                  Your note
                </p>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">
                  {booking.notes}
                </p>
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 rounded-2xl border border-blush-200/70 bg-blush-50/40 p-5 text-sm sm:grid-cols-3">
              {booking.guestEmail ? (
                <ContactItem Icon={Mail} value={booking.guestEmail} />
              ) : null}
              {booking.guestPhone ? (
                <ContactItem Icon={Phone} value={booking.guestPhone} />
              ) : null}
              <ContactItem Icon={Sparkles} value={booking.guestName ?? "Guest"} />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-charcoal p-8 text-blush-100/85 md:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-300">
              How to prep
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              {booking.service.preparation ??
                "Plan to arrive 5 minutes early. We welcome a favourite toy or comfort item — and a small snack always helps."}
            </p>
            <p className="mt-4 text-xs text-blush-100/60">
              Need to change anything? Reply to your confirmation email or call us — we&rsquo;ve got you.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/account/bookings"
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              Track this in your account dashboard →
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

function DetailRow({
  Icon,
  label,
  value,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blush-200/70 bg-white p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blush-50 text-primary-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-charcoal-light">
          {label}
        </p>
        <p className="mt-1 truncate font-medium text-charcoal">{value}</p>
      </div>
    </div>
  );
}

function ContactItem({
  Icon,
  value,
}: {
  Icon: typeof Calendar;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-charcoal-light">
      <Icon className="h-3.5 w-3.5 text-primary-600" />
      <span className="truncate">{value}</span>
    </div>
  );
}
