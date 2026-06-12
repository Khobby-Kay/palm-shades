import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative isolate overflow-hidden py-28 md:py-40">
      <div className="absolute inset-0 -z-10 bg-gradient-luxe" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-radial-blush" />
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </span>
          <h1 className="mt-6 font-display text-display-lg text-charcoal">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-charcoal-light md:text-lg">
            {description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/" size="lg">
              Return Home
            </LinkButton>
            <LinkButton href="/contact" size="lg" variant="outline">
              Contact the team
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
