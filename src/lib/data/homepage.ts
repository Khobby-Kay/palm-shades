/** Homepage module copy — Palm Shades luxury eyewear. */

export const homeHero = {
  eyebrow: "Palm Shades · See Luxury Clearly",
  title: "Designer Sunglasses & Optical Frames — Curated for You",
  description:
    "Premium eyewear styled for Ghana's discerning crowd. Expert fittings, lens guidance, and frames that look as good on Oxford Street as they do abroad.",
  primaryCta: { label: "Shop Eyewear", href: "/shop" },
  secondaryCta: { label: "Our Story", href: "/about" },
} as const;

export type HomeCategoryTile = {
  slug: string;
  name: string;
  badge: string;
};

export const homeCategoryTiles: HomeCategoryTile[] = [
  { slug: "sunglasses", name: "Sunglasses", badge: "Best sellers" },
  { slug: "optical-frames", name: "Optical Frames", badge: "New season" },
  { slug: "luxury-collection", name: "Luxury Collection", badge: "Limited" },
  { slug: "blue-light", name: "Blue Light", badge: "Work & screen" },
  { slug: "accessories", name: "Accessories", badge: "Essentials" },
  { slug: "gift-sets", name: "Gift Sets", badge: "Curated" },
];

export const homeSections = {
  categories: {
    eyebrow: "Shop by collection",
    title: "Find your perfect frame",
    cta: { label: "Browse all eyewear", href: "/shop" },
  },
  trending: {
    eyebrow: "Trending now",
    title: "Frames our clients love",
    cta: { label: "View all products", href: "/shop" },
  },
  newArrivals: {
    eyebrow: "Just arrived",
    title: "New season eyewear",
    description:
      "Fresh arrivals in acetate, metal, and titanium — polarized lenses, gradient tints, and timeless silhouettes.",
    cta: { label: "View new arrivals", href: "/shop?sort=new" },
  },
  trust: {
    eyebrow: "The Palm Shades difference",
    title: "Luxury you can trust",
    intro:
      "Every frame is chosen for fit, finish, and longevity — backed by expert fitting and genuine care.",
    cta: { label: "Learn more", href: "/about" },
  },
  shopCta: {
    eyebrow: "Shop with Palm Shades",
    title: "See luxury clearly.",
    description:
      "Designer sunglasses, optical frames, and lens services — plus private fittings at our Accra boutique.",
    primaryCta: { label: "Explore shop", href: "/shop" },
    secondaryCta: { label: "Book a fitting", href: "/book" },
  },
} as const;

export const homeTrustPillars = [
  {
    title: "Curated luxury",
    body: "Hand-selected frames from premium houses — no filler, only pieces worth wearing for years.",
  },
  {
    title: "Expert fitting",
    body: "Optician-guided measurements and lens advice so your frames sit perfectly and perform beautifully.",
  },
  {
    title: "White-glove service",
    body: "Elegant packaging, careful delivery across Ghana, and a serene boutique experience in Osu, Accra.",
  },
] as const;
