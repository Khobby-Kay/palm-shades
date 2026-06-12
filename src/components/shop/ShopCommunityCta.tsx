import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

/** Sarah Lawson–style “Join Our Community” block at the bottom of shop. */
export function ShopCommunityCta() {
  return (
    <section className="relative mt-16 md:mt-20">
      <div className="rounded-t-[2.5rem] bg-charcoal px-6 py-14 text-white md:px-10 md:py-20">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10">
              <Mail className="h-6 w-6 text-primary-300" />
            </div>

            <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">
              Join Our Community
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              Stay up to date with new arrivals, trunk shows, and members-only
              offers from Palm Shades.
            </p>

            <form
              className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-stretch"
              aria-label="Newsletter signup"
            >
              <label htmlFor="shop-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="shop-newsletter-email"
                type="email"
                required
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-xl border border-white/20 bg-charcoal-soft px-4 text-sm text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30 sm:rounded-l-xl sm:rounded-r-none"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-xl bg-primary-500 px-8 text-sm font-bold text-charcoal transition-colors hover:bg-primary-400 sm:rounded-l-none sm:rounded-r-xl"
              >
                Join
              </button>
            </form>

            <p className="mt-4 text-[11px] text-white/50">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </Container>
      </div>
    </section>
  );
}
