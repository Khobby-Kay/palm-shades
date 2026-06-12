import { Container } from "@/components/ui/Container";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { media } from "@/lib/media";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterCta() {
  return (
    <section className="pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-luxe p-10 ring-1 ring-blush-200/70 md:p-16">
          <div className="absolute inset-0 -z-10">
            <SmartImage
              src={media.newsletter.image}
              alt={media.newsletter.alt}
              variant="blush"
              sizes={IMAGE_SIZES.newsletter}
              loading="lazy"
              className={cn(
                "opacity-40",
                media.newsletter.imageClassName ?? "object-cover object-center"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blush-50/95 via-blush-50/85 to-blush-50/70" />
          </div>
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 -bottom-32 h-72 w-72 rounded-full bg-blush-100 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Join the Palm Shades Family
              </span>
              <h2 className="mt-6 font-display text-display-md text-charcoal">
                A touch of luxury, in your inbox.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-charcoal-light md:text-lg">
                Subscribers get first-look access to new arrivals, boutique
                openings, and members-only treats &mdash; including 10% off your first order.
              </p>
            </div>
            <form className="flex flex-col gap-3" aria-label="Newsletter signup">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="your@email.com"
                className="h-14 rounded-full border border-blush-200 bg-white px-6 text-sm text-charcoal placeholder:text-charcoal-light/60 shadow-soft focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/30"
              />
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-white shadow-luxe transition-all hover:-translate-y-0.5 hover:bg-charcoal-soft"
              >
                Send me the Palm Shades Letter
              </button>
              <p className="text-center text-[11px] text-charcoal-light/80">
                No spam, ever. Unsubscribe in one click.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
