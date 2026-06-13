import Link from "next/link";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { services } from "@/lib/data/services";
import { siteConfig } from "@/lib/site";

const STEPS = [
  { n: 1, title: "Pick a fitting", body: "Frame fitting, lens consult, or styling session." },
  { n: 2, title: "Choose date & time", body: "Same-week slots · no account required." },
  { n: 3, title: "Confirm on WhatsApp", body: "We reply fast to lock your appointment." },
] as const;

/** 3-step pitch strip on the book landing page. */
export function QuickBookStrip() {
  const featured = services.filter((s) => s.isFeatured).slice(0, 3);

  return (
    <section className="border-b border-blush-200/60 bg-white">
      <Container className="py-8 md:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            Book in under 60 seconds
          </p>
          <h2 className="mt-2 font-display text-2xl text-charcoal md:text-3xl">
            Three steps to your fitting
          </h2>
        </div>

        <ol className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {STEPS.map(({ n, title, body }) => (
            <li
              key={n}
              className="rounded-2xl border border-blush-200/70 bg-blush-50/40 p-4 text-center sm:p-5"
            >
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {n}
              </span>
              <p className="mt-3 font-medium text-charcoal">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-light">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {featured.map((s) => (
            <Link
              key={s.slug}
              href={`/book?service=${s.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <Calendar className="h-3.5 w-3.5 text-primary-600" />
              {s.name.split(" ").slice(0, 2).join(" ")}
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-4 text-xs text-charcoal-light">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary-600" />
            {siteConfig.contact.hours[0].hours} weekdays
          </span>
          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Or chat on WhatsApp first
          </a>
        </div>
      </Container>
    </section>
  );
}
