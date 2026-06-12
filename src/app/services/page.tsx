import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, itemListSchema } from "@/lib/seo";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import { ServiceCard } from "@/components/services/ServiceCard";
import { services } from "@/lib/data/services";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Eyewear Services in Accra — Fittings, Lenses & Styling",
  description:
    "Book Palm Shades in Accra — frame fittings, prescription lens consultations, sunglasses styling, repairs, corporate gifting and private trunk shows.",
  path: "/services",
  keywords: [
    "eyewear fitting Accra",
    "optician consultation Ghana",
    "sunglasses styling Accra",
    "lens glazing Accra",
    "luxury eyewear services Ghana",
  ],
});

export default function ServicesPage() {
  const featured = services.filter((s) => s.isFeatured);
  const others = services.filter((s) => !s.isFeatured);

  return (
    <>
      <JsonLd
        data={itemListSchema({
          name: "Palm Shades Eyewear Services",
          path: "/services",
          items: services.map((s) => ({
            name: s.name,
            url: `/services/${s.slug}`,
          })),
        })}
      />
      <section className="relative isolate overflow-hidden border-b border-blush-200/60 bg-gradient-luxe">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-blush" />
        <Container className="py-12 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-800">
              <Sparkles className="h-3.5 w-3.5" />
              Eyewear Services
            </span>
            <h1 className="mt-6 font-display text-display-lg text-charcoal">
              Expert care, elegantly delivered.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-charcoal-light md:text-lg">
              {siteConfig.brand.story.specialize} Book frame fittings, lens consultations,
              styling sessions, repairs, and private trunk shows with our team.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/book" size="lg" variant="primary">
                Book a fitting
              </LinkButton>
              <LinkButton href="#all-services" size="lg" variant="outline">
                Browse the menu
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-24">
        <Container>
          <SectionBlockHeader
            title="Signature services"
            ctaHref="/book"
            ctaLabel="Book now"
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {featured.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Container>
      </section>

      {others.length > 0 ? (
        <section id="all-services" className="border-t border-blush-200/60 bg-blush-50/40 py-14 md:py-24">
          <Container>
            <SectionBlockHeader title="Full service menu" />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {others.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
