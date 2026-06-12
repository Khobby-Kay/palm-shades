import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { ContactPhones } from "@/components/layout/ContactPhones";
import { siteConfig } from "@/lib/site";

const QUICK_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const LEGAL_LINKS = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cv-auto mt-24 bg-charcoal pb-[calc(4rem+env(safe-area-inset-bottom))] text-blush-100 lg:pb-0">
      <Container>
        {/* Top: brand + nav */}
        <div className="grid gap-10 border-b border-white/10 py-14 md:grid-cols-[1.4fr,1fr] md:gap-16">
          <div>
            <Logo size="lg" tone="light" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-blush-100/70">
              {siteConfig.description.slice(0, 160)}…
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-blush-100/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                <ContactPhones linkClassName="hover:text-white" />
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Footer">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-300">
              Explore
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blush-100/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-2.5">
              {[
                { href: siteConfig.socials.instagram, Icon: Instagram, label: "Instagram" },
                { href: siteConfig.socials.facebook, Icon: Facebook, label: "Facebook" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-primary-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom: copyright + legal */}
        <div className="flex flex-col gap-3 py-6 text-xs text-blush-100/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} Palm Shades. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-blush-100/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
