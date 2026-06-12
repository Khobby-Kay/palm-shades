/** Shared `sizes` hints so Next.js serves appropriately sized images. */
export const IMAGE_SIZES = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw",
  productGrid: "(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw",
  productDetail: "(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 50vw",
  categoryCard: "(max-width: 480px) 72vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 220px",
  serviceCard: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  galleryTile: "(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw",
  galleryHome: "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw",
  newsletter: "(max-width: 1024px) 100vw, 1200px",
  aboutPortrait: "(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 50vw",
  cartThumb: "80px",
  productThumb: "80px",
} as const;

export const IMAGE_QUALITY = {
  hero: 92,
  product: 88,
  default: 80,
  thumb: 76,
} as const;
