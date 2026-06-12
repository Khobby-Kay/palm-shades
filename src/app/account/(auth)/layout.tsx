import Link from "next/link";
import { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-luxe">
      <div className="absolute inset-0 -z-10 bg-radial-blush opacity-70" />
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-16">
        <div className="grid w-full max-w-5xl items-stretch gap-10 lg:grid-cols-[1.05fr,1fr]">
          {/* Brand panel */}
          <div className="relative hidden overflow-hidden rounded-[2rem] bg-charcoal p-10 text-blush-100/85 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="font-display text-2xl text-white">
                Palm Shades <span className="text-[10px] uppercase tracking-[0.22em] text-primary-300">Luxury Eyewear</span>
              </Link>
              <p className="mt-10 max-w-sm font-display text-3xl leading-[1.2] text-white">
                See luxury clearly in Accra.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-blush-100/75">
                Sign in to manage fittings, track eyewear orders and
                save the frames you love — all in one polished place.
              </p>
            </div>

            <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
            <ul className="relative space-y-3 text-[13px] text-blush-100/85">
              {[
                "Track every order from packed to delivered",
                "Book a fitting in a few taps — anytime",
                "Save styles & wishlists across devices",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-300" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form panel */}
          <div className="relative flex items-center">
            <div className="w-full rounded-[2rem] bg-white p-8 shadow-luxe ring-1 ring-blush-200/60 md:p-12">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-light transition-colors hover:text-primary-700 lg:hidden"
              >
                <span aria-hidden>&larr;</span> Back to store
              </Link>
              {children}
              <p className="mt-8 text-center text-[11px] uppercase tracking-[0.22em] text-charcoal-light">
                By continuing you agree to our terms · {siteConfig.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
