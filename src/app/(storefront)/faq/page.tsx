import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqItems, faqCategories } from "@/lib/data/faq";
import { buildMetadata, faqPageSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Fittings, Shipping & Eyewear Care",
  description:
    "Frequently asked questions about Palm Shades — boutique fittings, home fittings, shipping, returns and accounts in Accra, Ghana.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItems)} />
      <section className="border-b border-blush-200/60 bg-gradient-luxe py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Help centre"
            title="Questions, answered gently."
            description="Everything you need to know about fittings, the boutique, eyewear and your account."
          />
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-14">
          {faqCategories.map((cat) => {
            const items = faqItems.filter((f) => f.category === cat);
            return (
              <div key={cat}>
                <h2 className="font-display text-2xl text-charcoal">{cat}</h2>
                <div className="mt-6">
                  <FaqAccordion items={items} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-16 text-center text-sm text-charcoal-light">
          Still need help?{" "}
          <Link href="/contact" className="font-medium text-primary-700 hover:text-primary-800">
            Contact our team
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
