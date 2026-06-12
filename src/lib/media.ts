/**
 * Palm Shades brand photography — HD local assets featuring Black Ghanaian clientele.
 */

const img = (file: string) => `/images/${file}`;

export const brandImages = {
  heroSunglasses: img("palm-hero-sunglasses-hd.jpg"),
  heroOptical: img("palm-hero-optical-hd.jpg"),
  heroLuxury: img("palm-hero-luxury-hd.jpg"),
  lookbook1: img("palm-lookbook-rooftop-black.jpg"),
  lookbook2: img("palm-lookbook-black-woman-sunglasses.jpg"),
  lookbook3: img("palm-lookbook-black-man-frames.jpg"),
  lookbook4: img("palm-hero-optical-hd.jpg"),
  lookbook5: img("palm-lookbook-accessories.jpg"),
  lookbook6: img("palm-hero-boutique-hd.jpg"),
  boutique: img("palm-hero-boutique-hd.jpg"),
  detail: img("palm-product-cat-eye.jpg"),
  productFallback: img("palm-product-aviator.jpg"),
  bobWhite: img("palm-product-aviator.jpg"),
} as const;

export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  /** Responsive object-position — mobile-first focal point for faces/subjects */
  imageClassName?: string;
  eyebrow?: string;
  heading: string;
  highlight: string;
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export const heroSlides: HeroSlide[] = [
  {
    id: "optical",
    image: brandImages.heroOptical,
    imageClassName:
      "object-cover object-[center_30%] sm:object-center lg:object-[center_35%]",
    alt: "Black Ghanaian man fitted for palm green optical frames in Palm Shades boutique",
    eyebrow: "Palm Shades · Optical",
    heading: "Frames that",
    highlight: "define you.",
    subhead:
      "Prescription-ready optical frames with expert fitting and lens guidance — right here in Osu.",
    primaryCta: { label: "Shop Frames", href: "/shop?category=optical-frames" },
    secondaryCta: { label: "Book fitting", href: "/book" },
  },
  {
    id: "sunglasses",
    image: brandImages.heroSunglasses,
    imageClassName:
      "object-cover object-[center_18%] sm:object-[center_22%] lg:object-[center_28%]",
    alt: "Black Ghanaian woman wearing champagne gold aviator sunglasses at golden hour",
    eyebrow: "Palm Shades · New Season",
    heading: "Designer sunglasses",
    highlight: "made for you.",
    subhead:
      "Polarized lenses and iconic silhouettes — curated for Accra's most discerning style set.",
    primaryCta: { label: "Shop Sunglasses", href: "/shop?category=sunglasses" },
    secondaryCta: { label: "Our Story", href: "/about" },
  },
  {
    id: "luxury",
    image: brandImages.heroLuxury,
    imageClassName:
      "object-cover object-[center_40%] sm:object-[center_35%] lg:object-[center_30%]",
    alt: "Black Ghanaian couple in designer sunglasses at Accra coastline sunset",
    eyebrow: "Palm Shades · See Luxury Clearly",
    heading: "See luxury",
    highlight: "clearly.",
    subhead:
      "White-glove service and eyewear chosen for fit, finish, and the way you move through the world.",
    primaryCta: { label: "Explore Shop", href: "/shop" },
    secondaryCta: { label: "Lookbook", href: "/gallery" },
  },
];

export const homeCategoryImages: Record<string, string> = {
  sunglasses: img("palm-lookbook-black-woman-sunglasses.jpg"),
  "optical-frames": img("palm-lookbook-black-man-frames.jpg"),
  "luxury-collection": img("palm-hero-luxury-hd.jpg"),
  "blue-light": img("palm-product-blue-light.jpg"),
  accessories: img("palm-lookbook-accessories.jpg"),
  "gift-sets": img("palm-product-gift-set.jpg"),
};

export const media = {
  hero: {
    image: heroSlides[0].image,
    alt: heroSlides[0].alt,
  },
  about: {
    image: brandImages.boutique,
    alt: "Black optician assisting a client at Palm Shades boutique in Accra",
  },
  newsletter: {
    image: brandImages.detail,
    alt: "Close-up of luxury eyewear details",
  },
  gallery: [
    brandImages.lookbook1,
    brandImages.lookbook2,
    brandImages.lookbook3,
    brandImages.lookbook4,
    brandImages.lookbook5,
    brandImages.lookbook6,
    img("palm-hero-sunglasses-hd.jpg"),
    img("palm-hero-luxury-hd.jpg"),
    img("palm-lookbook-rooftop-black.jpg"),
  ],
  categories: homeCategoryImages,
  products: {
    "riviera-aviator-gold": img("palm-product-aviator.jpg"),
    "osu-acetate-square": img("palm-product-acetate-square.jpg"),
    "champagne-cat-eye": img("palm-product-cat-eye.jpg"),
    "palm-polarized-round": img("palm-lookbook-rooftop-black.jpg"),
    "meridian-titanium-rimless": img("palm-product-titanium.jpg"),
    "screen-shield-blue-light": img("palm-product-blue-light.jpg"),
    "signature-leather-case": img("palm-lookbook-accessories.jpg"),
    "gold-chain-temple": img("palm-product-chain.jpg"),
    "collectors-limited-edition": img("palm-product-limited-pilot.jpg"),
    "gradient-lens-pilot": img("palm-product-aviator.jpg"),
    "executive-browline": img("palm-product-browline.jpg"),
    "gift-set-duo": img("palm-product-gift-set.jpg"),
    "midnight-wayfarer": img("palm-product-wayfarer.jpg"),
    "tortoise-round-classic": img("palm-product-tortoise-round.jpg"),
    "sport-wrap-polarized": img("palm-product-sport-wrap.jpg"),
    "ivory-butterfly": img("palm-product-butterfly.jpg"),
    "lens-care-kit": img("palm-product-care-kit.jpg"),
    "foldable-travel-case": img("palm-lookbook-accessories.jpg"),
    "reading-classic-horn": img("palm-product-tortoise-round.jpg"),
    "corporate-gift-trio": img("palm-product-gift-set.jpg"),
  } as Record<string, string>,
  services: {
    "frame-fitting": img("palm-hero-optical-hd.jpg"),
    "lens-consultation": img("palm-product-titanium.jpg"),
    "sunglasses-styling": img("palm-lookbook-black-woman-sunglasses.jpg"),
    "repairs-adjustments": img("palm-product-care-kit.jpg"),
    "blue-light-consultation": img("palm-product-blue-light.jpg"),
    "corporate-gifting": img("palm-product-gift-set.jpg"),
    "private-trunk-show": img("palm-hero-boutique-hd.jpg"),
    "virtual-styling": img("palm-hero-optical-hd.jpg"),
  } as Record<string, string>,
} as const;

export function getCategoryImage(slug: string) {
  return media.categories[slug] ?? brandImages.lookbook1;
}

export function getServiceImage(slug: string) {
  return media.services[slug] ?? brandImages.boutique;
}

export function getProductImage(slug: string) {
  return media.products[slug];
}
