import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/orders";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My Orders" };

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const email = user.email?.toLowerCase();

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(email ? [{ email }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
          Shop
        </p>
        <h1 className="mt-2 font-display text-display-md text-charcoal">Your orders</h1>
        <p className="mt-3 text-sm text-charcoal-light">
          Every purchase linked to your account or email address.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-card ring-1 ring-blush-200/60">
          <p className="text-charcoal-light">No orders yet — your first parcel is waiting in the shop.</p>
          <LinkButton href="/shop" variant="primary" size="md" className="mt-6">
            Browse the shop
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-blush-200/60 md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-charcoal">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-charcoal-light">
                    Placed{" "}
                    {o.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-charcoal">
                    {formatPrice(o.total, { currency: o.currency })}
                  </p>
                  <p className="mt-1 text-xs text-charcoal-light">
                    {paymentMethodLabel(o.paymentMethod)} · {o.paymentStatus}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 border-t border-blush-200/60 pt-5 text-sm">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3 text-charcoal-light">
                    <span>
                      {it.name} <span className="text-charcoal-light/70">× {it.quantity}</span>
                    </span>
                    <span className="text-charcoal">
                      {formatPrice(it.price * it.quantity, { currency: o.currency })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/checkout/success/${o.orderNumber}`}
                  className="text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  View confirmation →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
