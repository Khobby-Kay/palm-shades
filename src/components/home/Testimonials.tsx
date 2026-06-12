import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/data/testimonials";

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-blush-50/50 via-white to-blush-50/30" />
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The Reviews"
            title="Kind words from our clients."
            description="The greatest compliment is when clients return — and bring their friends and family with them."
          />
          <div className="flex items-center gap-4 rounded-3xl border border-blush-200 bg-white/70 px-6 py-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-1 text-primary-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="leading-tight">
              <p className="font-display text-2xl text-charcoal">4.9</p>
              <p className="text-xs text-charcoal-light">From 600+ reviews</p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t, i) => (
            <figure
              key={t.id}
              className="relative flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-card ring-1 ring-blush-200/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe"
            >
              <Quote className="absolute right-7 top-7 h-7 w-7 text-primary-100" />
              <div className="flex items-center gap-1 text-primary-600">
                {Array.from({ length: 5 }).map((_, ii) => (
                  <Star
                    key={ii}
                    className={`h-3.5 w-3.5 ${ii < t.rating ? "fill-current" : "opacity-25"}`}
                  />
                ))}
              </div>
              <blockquote className="text-[15px] leading-relaxed text-charcoal">
                &ldquo;{t.body}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-4">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full font-display text-base ${
                    i % 2 === 0
                      ? "bg-blush-100 text-primary-700"
                      : "bg-gold/15 text-gold-dark"
                  }`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="font-medium text-charcoal">{t.author}</p>
                  <p className="text-xs text-charcoal-light">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
