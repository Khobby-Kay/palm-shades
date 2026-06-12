import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, webPageSchema } from "@/lib/seo";
import { ContactPhones } from "@/components/layout/ContactPhones";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Palm Shades — Boutique Location & Enquiries in Accra",
  description:
    "Contact Palm Shades on Oxford Street, Osu, Accra. Call, email or message us about fittings, orders, and corporate gifting.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          ...webPageSchema({
            name: "Contact Palm Shades",
            description: siteConfig.description,
            path: "/contact",
          }),
          "@type": "ContactPage",
        }}
      />
      <section className="border-b border-blush-200/60 bg-gradient-luxe py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Say hello"
            title="We'd love to hear from you."
            description="Questions about a fitting, an order, or corporate gifting? Send us a note — we read every message."
          />
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr,1.1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-blush-200/60 sm:p-8">
              <h2 className="font-display text-2xl text-charcoal">Visit the boutique</h2>
              <ul className="mt-6 space-y-5 text-sm text-charcoal-light">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  {siteConfig.contact.address}
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <ContactPhones />
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary-700">
                    {siteConfig.contact.email}
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-blush-50/70 p-5 sm:p-8">
              <h3 className="flex items-center gap-2 font-display text-xl text-charcoal">
                <Clock className="h-5 w-5 text-primary-600" />
                Opening hours
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-charcoal-light">
                {siteConfig.contact.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="font-medium text-charcoal">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-blush-200/60 sm:p-8 md:p-10">
            <h2 className="font-display text-2xl text-charcoal">Send a message</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
