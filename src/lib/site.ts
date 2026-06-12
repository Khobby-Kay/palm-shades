import {
  brandMission,
  brandStats,
  brandStory,
  brandValues,
  brandVision,
  serviceOfferings,
  whyChooseUs,
} from "@/lib/data/brand";

export const siteConfig = {
  name: "Palm Shades",
  shortName: "Palm Shades",
  alternateNames: ["Palm Shades", "Palm Shades Eyewear", "Palm Shades Luxury Glasses"],
  tagline: `${brandStory.tagline} · ${brandStory.logoTagline}`,
  description: `${brandStory.intro} ${brandStory.specialize} ${brandStory.experience}`,
  stats: brandStats,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-GH",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@palmshades.com",
    phones: [
      { display: "055 432 1098", tel: "+233554321098" },
      { display: "030 271 8840", tel: "+233302718840" },
    ],
    phone: "055 432 1098 · 030 271 8840",
    address: "Osu · Accra, Ghana",
    streetAddress: "Oxford Street, Osu",
    city: "Accra",
    region: "Greater Accra",
    postalCode: "",
    countryCode: "GH",
    hours: [
      { day: "Mon – Fri", hours: "10:00 AM — 7:00 PM" },
      { day: "Saturday", hours: "10:00 AM — 8:00 PM" },
      { day: "Sunday", hours: "12:00 PM — 5:00 PM" },
    ],
  },
  socials: {
    instagram: "https://instagram.com/palmshades",
    tiktok: "https://tiktok.com/@palmshades",
    facebook: "https://facebook.com/palmshades",
    whatsapp: "https://wa.me/233554321098",
  },
  seo: {
    defaultImage: "/images/palm-shades-og.png",
    favicon: "/images/palm-shades-icon.png",
    geo: {
      latitude: 5.556,
      longitude: -0.182,
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 86,
      bestRating: 5,
      worstRating: 1,
    },
  },
  brand: {
    story: brandStory,
    vision: brandVision,
    mission: brandMission,
    values: brandValues,
    whyChooseUs,
    serviceOfferings,
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/gallery", label: "Lookbook" },
    { href: "/book", label: "Book Fitting" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  footerLinks: {
    Shop: [
      { href: "/shop", label: "All Eyewear" },
      { href: "/shop?category=sunglasses", label: "Sunglasses" },
      { href: "/shop?category=optical-frames", label: "Optical Frames" },
      { href: "/shop?category=luxury-collection", label: "Luxury Collection" },
      { href: "/shop?category=blue-light", label: "Blue Light" },
      { href: "/shop?category=accessories", label: "Accessories" },
    ],
    Services: [
      { href: "/book", label: "Book a Fitting" },
      { href: "/services", label: "Our Services" },
      { href: "/contact", label: "Corporate & Gifting" },
      { href: "/faq", label: "Lens & Care FAQ" },
    ],
    Company: [
      { href: "/about", label: "About Palm Shades" },
      { href: "/gallery", label: "Lookbook" },
      { href: "/reviews", label: "Reviews" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
    Policies: [
      { href: "/policies/shipping", label: "Shipping Policy" },
      { href: "/policies/returns", label: "Returns & Refunds" },
      { href: "/policies/privacy", label: "Privacy Policy" },
      { href: "/policies/terms", label: "Terms of Service" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
