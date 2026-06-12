import Link from "next/link";
import { Phone } from "lucide-react";
import { getActiveAnnouncement } from "@/lib/banners";
import { ContactPhones } from "@/components/layout/ContactPhones";
import { siteConfig } from "@/lib/site";

export async function AnnouncementBar() {
  const banner = await getActiveAnnouncement();
  const text = banner?.title ?? "Complimentary lens cloth with every frame · Visit our Osu boutique";
  const href = banner?.ctaHref;
  const cta = banner?.ctaLabel;

  return (
    <div className="bg-gradient-brand text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 text-center text-[10px] tracking-[0.14em] sm:justify-between sm:text-left sm:text-[11px] sm:tracking-[0.18em] lg:px-8">
        <span className="truncate uppercase">
          {href ? (
            <Link href={href} className="hover:text-white">
              {text}
              {cta ? ` · ${cta}` : ""}
            </Link>
          ) : (
            text
          )}
        </span>
        <div className="hidden items-center gap-6 sm:flex">
          <span className="inline-flex items-center gap-2 uppercase">
            <Phone className="h-3 w-3 shrink-0" />
            <ContactPhones linkClassName="hover:text-white" />
          </span>
          <Link href="/book" className="uppercase hover:text-white">
            Book a Fitting
          </Link>
        </div>
      </div>
    </div>
  );
}
