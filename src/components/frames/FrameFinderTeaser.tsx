import Link from "next/link";
import { ArrowUpRight, ScanFace } from "lucide-react";
import { Container } from "@/components/ui/Container";

/** Homepage CTA for the Frame Finder experience. */
export function FrameFinderTeaser() {
  return (
    <section className="border-y border-blush-200/60 bg-gradient-to-br from-charcoal via-charcoal-soft to-primary-900 py-14 text-white md:py-20">
      <Container className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="max-w-xl text-center md:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-200">
            Only at Palm Shades
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            Not sure which frame suits you?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blush-100/85 md:text-base">
            Our Frame Finder matches your face shape and lifestyle to curated eyewear —
            built for Ghana&apos;s sun, your workday, and evenings in Osu.
          </p>
        </div>
        <Link
          href="/frame-finder"
          className="group inline-flex items-center gap-3 rounded-full bg-primary-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition-all hover:bg-primary-500 hover:-translate-y-0.5"
        >
          <ScanFace className="h-5 w-5" />
          Try Frame Finder
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </Container>
    </section>
  );
}
