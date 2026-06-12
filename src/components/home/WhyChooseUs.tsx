import { Award, Gem, HeartHandshake, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionBlockHeader } from "@/components/home/SectionBlockHeader";
import { siteConfig } from "@/lib/site";

const icons = [Award, Gem, HeartHandshake, Sparkles];

export function WhyChooseUs() {
  const items = siteConfig.brand.whyChooseUs;

  return (
    <section className="py-14 md:py-24">
      <Container>
        <SectionBlockHeader
          title="Why choose Palm Shades"
          ctaHref="/about"
          ctaLabel="Our story"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-blush-200/70 bg-white p-5 shadow-card sm:rounded-3xl sm:p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg text-charcoal sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-light">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
