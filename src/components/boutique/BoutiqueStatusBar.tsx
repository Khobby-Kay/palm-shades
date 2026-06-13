import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { getBoutiqueStatus, boutiqueDirectionsUrl } from "@/lib/boutique-hours";
import { siteConfig } from "@/lib/site";

/** Top strip — live Osu boutique status, directions, and WhatsApp. */
export function BoutiqueStatusBar() {
  const status = getBoutiqueStatus();

  return (
    <div className="bg-gradient-brand text-white">
      <div className="mx-auto flex h-auto min-h-9 max-w-7xl flex-col gap-1 px-4 py-2 text-center text-[10px] tracking-[0.12em] sm:h-9 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 sm:text-left sm:text-[11px] sm:tracking-[0.16em] lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold uppercase ${
              status.isOpen
                ? "bg-white/20 text-white"
                : "bg-charcoal/25 text-white/90"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status.isOpen ? "bg-emerald-300" : "bg-white/50"
              }`}
              aria-hidden
            />
            {status.label}
          </span>
          <span className="inline-flex items-center gap-1 uppercase text-white/90">
            <MapPin className="h-3 w-3 shrink-0" />
            {status.detail}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-5">
          <a
            href={boutiqueDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase text-white/90 underline-offset-2 hover:text-white hover:underline"
          >
            Directions
          </a>
          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 uppercase text-white/90 hover:text-white"
          >
            <MessageCircle className="h-3 w-3" />
            WhatsApp
          </a>
          <Link
            href="/book"
            className="hidden uppercase text-white/90 hover:text-white sm:inline"
          >
            Book fitting
          </Link>
        </div>
      </div>
    </div>
  );
}
