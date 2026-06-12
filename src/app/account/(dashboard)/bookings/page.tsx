import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Home } from "lucide-react";
import { requireUser } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My Bookings" };

export default async function AccountBookingsPage() {
  const user = await requireUser("/account/bookings");
  const email = user.email?.toLowerCase();

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(email ? [{ guestEmail: email }] : []),
      ],
    },
    orderBy: { date: "desc" },
    include: { service: true, child: true },
  });

  return (
    <div>
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
          Fittings
        </p>
        <h1 className="mt-2 font-display text-display-md text-charcoal">Your fittings</h1>
        <p className="mt-3 text-sm text-charcoal-light">
          Past and upcoming Palm Shades fittings linked to your account.
        </p>
      </header>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-card ring-1 ring-blush-200/60">
          <p className="text-charcoal-light">No fittings yet — reserve yours when you&rsquo;re ready.</p>
          <LinkButton href="/book" variant="primary" size="md" className="mt-6">
            Book a fitting
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {bookings.map((b) => {
            const dateStr = b.date.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const LocationIcon = b.location === "HOME_SERVICE" ? Home : MapPin;

            return (
              <li
                key={b.id}
                className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-blush-200/60 md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl text-charcoal">{b.service.name}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-light">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary-600" />
                        {dateStr} · {b.startTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <LocationIcon className="h-3.5 w-3.5 text-primary-600" />
                        {b.location === "HOME_SERVICE" ? "Home service" : "In-boutique"}
                      </span>
                    </p>
                    {b.child ? (
                      <p className="mt-2 text-sm text-charcoal-light">
                        For <strong className="text-charcoal">{b.child.name}</strong>
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-blush-50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary-700">
                      {b.status}
                    </span>
                    <p className="mt-2 font-display text-lg text-charcoal">
                      {formatPrice(b.service.price, { currency: b.service.currency })}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/book/success/${b.id}`}
                  className="mt-5 inline-block text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  View confirmation →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
