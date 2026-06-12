import type { Metadata } from "next";
import Link from "next/link";
import { Target, Compass, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { JsonLd } from "@/components/seo/JsonLd";
import { media } from "@/lib/media";
import { buildMetadata, webPageSchema } from "@/lib/seo";
import { ContactPhones } from "@/components/layout/ContactPhones";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "About Palm Shades — Luxury Eyewear House in Accra, Ghana",
  description:
    "Palm Shades — curated designer sunglasses and optical frames, expert fittings, and white-glove service in the heart of Accra.",
  path: "/about",
  image: media.about.image,
});

export default function AboutPage() {
  const { story, vision, mission, values, whyChooseUs, serviceOfferings } =
    siteConfig.brand;
  const { clientsServed, yearsEstablished } = siteConfig.stats;

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: `About ${siteConfig.name}`,
          description: siteConfig.description,
          path: "/about",
        })}
      />

      <section className="relative isolate overflow-hidden border-b border-blush-200/60 bg-gradient-luxe">
        <div className="absolute inset-x-0 top-0 -z-10 h-[480px] bg-radial-blush" />
        <Container className="py-16 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
                {story.tagline}
              </p>
              <h1 className="mt-4 font-display text-display-lg text-charcoal">
                Where vision meets style.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal-light md:text-lg">
                {story.intro}
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal-light">
                {story.established} {story.specialize}
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal-light">
                {story.audience}
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal-light">
                {story.experience}
              </p>
              <div className="mt-8 flex flex-wrap gap-6">
                <Stat label="Happy clients" value={`${clientsServed.toLocaleString()}+`} />
                <Stat label="Years of excellence" value={`${yearsEstablished}+`} />
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/book" size="lg" variant="primary">
                  Book a fitting
                </LinkButton>
                <LinkButton href="/shop" size="lg" variant="outline">
                  Explore eyewear
                </LinkButton>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-luxe ring-1 ring-blush-200/60">
              <SmartImage
                src={media.about.image}
                alt={media.about.alt}
                variant="gold"
                priority
                sizes={IMAGE_SIZES.aboutPortrait}
                className="object-cover object-[center_30%] sm:object-center"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-blush-200/60 bg-blush-50/40 py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                <Target className="h-3.5 w-3.5" />
                Our vision
              </span>
              <p className="mt-4 font-display text-2xl leading-snug text-charcoal md:text-3xl">
                {vision}
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700">
                <Compass className="h-3.5 w-3.5" />
                Our mission
              </span>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-charcoal-light">
                {mission.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="What we offer"
            title="Our services"
            description="Expert fittings, lens consultations, and white-glove care — everything a luxury eyewear house should be."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceOfferings.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 rounded-2xl border border-blush-200/70 bg-white px-4 py-3 text-sm text-charcoal shadow-card"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-primary-600" />
                {name}
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <LinkButton href="/book" variant="primary" size="md">
              Book your fitting
            </LinkButton>
          </div>
        </Container>
      </section>

      <section className="border-t border-blush-200/60 bg-charcoal py-16 text-white md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why Palm Shades"
            title="Why choose us"
            description="Professional excellence, quality products, and a customer-centered experience — at prices that feel like affordable luxury."
            className="[&_h2]:text-white [&_p]:text-blush-100/80 [&_span]:text-primary-200"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-charcoal-soft p-6"
              >
                <h3 className="font-display text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-blush-100/80">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="What guides us"
            title="Our values"
            align="center"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {values.map((value) => (
              <span
                key={value}
                className="rounded-full border border-primary-200 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-800"
              >
                {value}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center font-display text-xl text-charcoal md:text-2xl">
            {story.closing}
          </p>
        </Container>
      </section>

      <section className="border-t border-blush-200/60 bg-blush-50/40 py-16 text-center md:py-20">
        <Container>
          <p className="font-display text-2xl text-charcoal md:text-3xl">
            Visit us at {siteConfig.contact.address}
          </p>
          <p className="mt-4 text-charcoal-light">
            <ContactPhones className="justify-center" />
            {" · "}
            <Link href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary-700">
              {siteConfig.contact.email}
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-primary-700 md:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-charcoal-light">
        {label}
      </p>
    </div>
  );
}
