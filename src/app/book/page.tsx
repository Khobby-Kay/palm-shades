import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Clock, Sparkles, ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { ServiceCard } from "@/components/services/ServiceCard";
import { BookingForm } from "@/components/booking/BookingForm";
import { QuickBookStrip } from "@/components/booking/QuickBookStrip";
import { WelcomeOfferBanner } from "@/components/booking/WelcomeOfferBanner";
import { services } from "@/lib/data/services";
import { getServiceImage } from "@/lib/media";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, webPageSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Book a Fitting — Palm Shades Accra",
  description:
    "Book your Palm Shades fitting online — frame fittings, lens consultations, styling sessions and home fittings in Accra, Ghana.",
  path: "/book",
  keywords: [
    "book eyewear fitting Accra",
    "optician appointment Ghana online",
    "Palm Shades fitting",
    "luxury eyewear boutique Accra",
  ],
});

export default function BookPage({
  searchParams,
}: {
  searchParams: { service?: string; promo?: string };
}) {
  const slug = searchParams.service;
  const welcomeOffer = searchParams.promo === "welcome15";

  const bookPageJsonLd = (
    <JsonLd
      data={webPageSchema({
        name: `Book an appointment — ${siteConfig.name}`,
        description:
          "Online fitting booking for frame fittings, lens consultations and styling sessions in Accra.",
        path: "/book",
      })}
    />
  );

  if (!slug) {
    return (
      <>
        {bookPageJsonLd}
        <section className="relative isolate overflow-hidden border-b border-blush-200/60 bg-gradient-luxe">
          <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-radial-blush" />
          <Container className="py-10 md:py-20">
            <SectionBlockHeader
              title="Choose a fitting to reserve"
              ctaHref="/services"
              ctaLabel="View all services"
            />
          </Container>
        </section>
        <QuickBookStrip />
        <Container className="pb-12 pt-6 md:py-16">
          {welcomeOffer ? <WelcomeOfferBanner /> : null}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} mode="book" />
            ))}
          </div>
        </Container>
      </>
    );
  }

  const service = services.find((s) => s.slug === slug);
  if (!service) redirect("/book");

  return (
    <>
      {bookPageJsonLd}
      <Container className="pt-6 md:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="-mx-1 flex items-center gap-1 overflow-x-auto pb-1 text-[10px] uppercase tracking-[0.16em] text-charcoal-light scrollbar-none sm:text-xs sm:tracking-[0.18em]"
        >
          <Link href="/" className="shrink-0 hover:text-primary-700">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/book" className="shrink-0 hover:text-primary-700">
            Book
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="shrink-0 text-charcoal">{service.name}</span>
        </nav>
      </Container>

      <Container className="py-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr] lg:gap-12">
          {/* Summary first on mobile */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-blush-200/60 sm:rounded-3xl">
              <div className="relative aspect-[2/1] sm:aspect-[5/4]">
                <SmartImage
                  src={getServiceImage(service.slug)}
                  alt={service.name}
                  fallbackLabel={service.name}
                  variant="gold"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                {service.isFeatured ? (
                  <span className="absolute left-4 top-4 rounded-full bg-charcoal px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                    Signature
                  </span>
                ) : null}
              </div>
              <div className="space-y-4 p-5 sm:p-7">
                <h2 className="font-display text-xl text-charcoal sm:text-2xl">
                  {service.name}
                </h2>
                <p className="line-clamp-3 text-sm leading-relaxed text-charcoal-light sm:line-clamp-none">
                  {service.shortDesc}
                </p>
                <dl className="grid grid-cols-3 gap-3 border-t border-blush-200/60 pt-4 text-center text-sm sm:grid-cols-1 sm:gap-3 sm:text-left">
                  <Row k="Duration" v={`${service.durationMin} min`} />
                  {service.ageRange ? <Row k="Ages" v={service.ageRange} /> : null}
                  <Row
                    k="From"
                    v={formatPrice(service.price, { currency: service.currency })}
                    big
                  />
                </dl>
              </div>
            </div>

            <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid lg:grid-cols-1">
              <Trust Icon={ShieldCheck} title="Free to cancel" sub="Up to 24h before" />
              <Trust Icon={Clock} title="Same-week slots" sub="Often available" />
              <Trust Icon={Sparkles} title="Expert opticians" sub="Boutique-trained team" />
            </div>
          </aside>

          <div className="order-2 lg:order-1">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary-700">
                Reserve your fitting
              </p>
              <h1 className="mt-2 font-display text-2xl text-charcoal sm:mt-4 sm:text-display-lg">
                Pick your date &amp; details
              </h1>
            </div>
            {welcomeOffer ? (
              <div className="mt-6 sm:mt-8">
                <WelcomeOfferBanner />
              </div>
            ) : null}
            <div className={welcomeOffer ? "mt-4 sm:mt-6" : "mt-6 sm:mt-8"}>
              <BookingForm service={service} />
            </div>
          </div>
        </div>
      </Container>

      <section className="border-t border-blush-200/60 bg-blush-50/40 py-12 md:py-20">
        <Container>
          <SectionBlockHeader
            title="Other fittings you might love"
            ctaHref="/services"
            ctaLabel="All services"
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {services
              .filter((s) => s.slug !== service.slug)
              .slice(0, 4)
              .map((s) => (
                <ServiceCard key={s.slug} service={s} mode="book" />
              ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-charcoal-light sm:text-sm sm:normal-case sm:tracking-normal">
        {k}
      </dt>
      <dd
        className={
          big
            ? "font-display text-base text-charcoal sm:text-xl"
            : "font-medium text-charcoal sm:text-sm"
        }
      >
        {v}
      </dd>
    </div>
  );
}

function Trust({
  Icon,
  title,
  sub,
}: {
  Icon: typeof Clock;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-blush-200/70 bg-white p-4 text-sm text-charcoal-light">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blush-50 text-primary-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium text-charcoal">{title}</p>
        <p className="text-[11px]">{sub}</p>
      </div>
    </div>
  );
}
