import { Container } from "@/components/ui/Container";
import { HomeAnimatedHeader } from "@/components/home/HomeAnimatedHeader";
import { HomeTrustGrid } from "@/components/home/HomeTrustGrid";
import { homeSections } from "@/lib/data/homepage";

export function HomeTrustSection() {
  const { trust } = homeSections;

  return (
    <section className="border-t border-blush-200/80 bg-blush-50/40 py-12 md:py-16">
      <Container>
        <HomeAnimatedHeader
          eyebrow={trust.eyebrow}
          title={trust.title}
          description={trust.intro}
          ctaHref={trust.cta.href}
          ctaLabel={trust.cta.label}
          align="center"
        />

        <HomeTrustGrid />
      </Container>
    </section>
  );
}
