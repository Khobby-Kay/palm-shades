import type { Metadata } from "next";
import Link from "next/link";
import { Package, Calendar, Users, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { requireUser } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/orders";
import { PersonalizationSyncCard } from "@/components/account/PersonalizationSyncCard";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const user = await requireUser("/account");
  const email = user.email?.toLowerCase();

  const [orders, bookings, children] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(email ? [{ email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { take: 2 } },
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(email ? [{ guestEmail: email }] : []),
        ],
      },
      orderBy: { date: "desc" },
      take: 3,
      include: { service: true },
    }),
    prisma.childProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-10">
      <PersonalizationSyncCard />
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
          Your space
        </p>
        <h1 className="mt-2 font-display text-display-md text-charcoal">
          Hello, {user.name?.split(" ")[0] ?? "friend"}.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal-light">
          Track orders, manage appointments and save guest profiles for faster booking next time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/book" variant="primary" size="md">
            Book a fitting
          </LinkButton>
          <LinkButton href="/shop" variant="outline" size="md">
            Shop eyewear
          </LinkButton>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          Icon={Package}
          label="Orders"
          value={String(orders.length > 0 ? "Recent" : "None yet")}
          href="/account/orders"
        />
        <StatCard
          Icon={Calendar}
          label="Bookings"
          value={String(bookings.length > 0 ? "Upcoming" : "None yet")}
          href="/account/bookings"
        />
        <StatCard
          Icon={Users}
          label="Guest profiles"
          value={String(children.length)}
          href="/account/children"
        />
      </div>

      {/* Recent orders */}
      <section className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60 md:p-9">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-charcoal">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-primary-700 hover:text-primary-800">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <Empty hint="Your shop orders will appear here once you checkout." ctaHref="/shop" ctaLabel="Start shopping" />
        ) : (
          <ul className="mt-6 divide-y divide-blush-200/60">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-charcoal">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-charcoal-light">
                    {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {paymentMethodLabel(o.paymentMethod)} · {o.paymentStatus}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-lg text-charcoal">
                    {formatPrice(o.total, { currency: o.currency })}
                  </p>
                  <Link
                    href={`/checkout/success/${o.orderNumber}`}
                    className="text-sm font-medium text-primary-700 hover:text-primary-800"
                  >
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent bookings */}
      <section className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60 md:p-9">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-charcoal">Appointments</h2>
          <Link href="/account/bookings" className="text-sm font-medium text-primary-700 hover:text-primary-800">
            View all
          </Link>
        </div>
        {bookings.length === 0 ? (
          <Empty hint="Fittings you've booked will show up here." ctaHref="/book" ctaLabel="Book now" />
        ) : (
          <ul className="mt-6 divide-y divide-blush-200/60">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-charcoal">{b.service.name}</p>
                  <p className="mt-1 text-xs text-charcoal-light">
                    {b.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    {" at "}
                    {b.startTime}
                    {" · "}
                    {b.status}
                  </p>
                </div>
                <Link
                  href={`/book/success/${b.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Package;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-blush-200/70 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blush-50 text-primary-700 ring-1 ring-primary-100">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.22em] text-charcoal-light">{label}</p>
      <p className="mt-1 font-display text-2xl text-charcoal">{value}</p>
    </Link>
  );
}

function Empty({
  hint,
  ctaHref,
  ctaLabel,
}: {
  hint: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-blush-50/60 p-6 text-center">
      <p className="text-sm text-charcoal-light">{hint}</p>
      <Link href={ctaHref} className="mt-4 inline-block text-sm font-medium text-primary-700 hover:text-primary-800">
        {ctaLabel} →
      </Link>
    </div>
  );
}
