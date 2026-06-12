import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  MapPin,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { ServiceCard } from "@/components/services/ServiceCard";
import { services } from "@/lib/data/services";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServiceImage } from "@/lib/media";
import {
  breadcrumbSchema,
  buildMetadata,
  serviceSchema,
} from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const s = services.find((s) => s.slug === params.slug);
  if (!s) return { title: "Not found" };
  return buildMetadata({
    title: `${s.name} in Accra — Book at Palm Shades`,
    description: `${s.shortDesc} Book ${s.name} at Palm Shades, Accra's luxury eyewear boutique on Oxford Street, Osu.`,
    path: `/services/${s.slug}`,
    image: getServiceImage(s.slug),
    imageAlt: s.name,
    keywords: [s.name, "eyewear fitting Accra", "book optician appointment Ghana", "Palm Shades"],
  });
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  const imageUrl = getServiceImage(service.slug);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service, imageUrl),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <Container className="pt-8 md:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-charcoal-light"
        >
          <Link href="/" className="hover:text-primary-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/services" className="hover:text-primary-700">Services</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-charcoal">{service.name}</span>
        </nav>
      </Container>

      {/* Hero */}
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-luxe">
            <SmartImage
              src={imageUrl}
              alt={service.name}
              fallbackLabel={service.name}
              variant="gold"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col gap-6">
            {service.isFeatured ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-charcoal px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                <Sparkles className="h-3 w-3" />
                Signature service
              </span>
            ) : null}
            <h1 className="font-display text-display-md text-charcoal">
              {service.name}
            </h1>
            <p className="text-base leading-relaxed text-charcoal-light md:text-lg">
              {service.description}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat Icon={Clock} label="Duration" value={`${service.durationMin} min`} />
              <Stat
                Icon={Sparkles}
                label="From"
                value={formatPrice(service.price, { currency: service.currency })}
              />
              <Stat
                Icon={Award}
                label="Ages"
                value={service.ageRange ?? "All"}
              />
              <Stat Icon={MapPin} label="Location" value="Boutique or home" />
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href={`/book?service=${service.slug}`}
                size="lg"
                variant="primary"
              >
                Book a fitting
              </LinkButton>
              <LinkButton href="/contact" size="lg" variant="outline">
                Ask a question
              </LinkButton>
            </div>

            <div className="mt-4 rounded-2xl bg-blush-50/70 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                What to expect
              </p>
              <p className="mt-3 text-sm leading-relaxed text-charcoal">
                {service.preparation ??
                  "Plan to arrive 5 minutes early with your current prescription if applicable. Our opticians will guide you through measurements, lens options, and frame selection."}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Why */}
      <section className="border-t border-blush-200/60 bg-blush-50/30 py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Why clients choose us"
            title="An unhurried hour, beautifully done."
            description="Every Palm Shades service is delivered by expert opticians — serene atmosphere, premium frames, and results you can trust."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { Icon: ShieldCheck, title: "Precise fitting", body: "Bridge width, temple length, and lens centration measured with care." },
              { Icon: Sparkles, title: "Comfort-first", body: "We pace every appointment to you — calm atmosphere, clear communication, beautiful results." },
              { Icon: Award, title: "Expert trained", body: "Years of experience with prescriptions, face shapes, and luxury frame selection." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush-50 text-primary-700 ring-1 ring-primary-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-charcoal">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-light">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Pair beautifully with"
              title="Other rituals you might love"
            />
            <Link
              href="/services"
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              See all services
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({
  Icon,
  label,
  value,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-blush-200/70 bg-white p-4">
      <div className="flex items-center gap-2 text-charcoal-light">
        <Icon className="h-3.5 w-3.5 text-primary-600" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 font-display text-lg text-charcoal">{value}</p>
    </div>
  );
}
