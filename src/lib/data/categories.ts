export type CategoryItem = {
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  accent?: "rose" | "blush" | "ivory" | "gold";
};

export const categories: CategoryItem[] = [
  {
    slug: "sunglasses",
    name: "Sunglasses",
    description: "Polarized and gradient lenses in iconic silhouettes — sun protection with presence.",
    accent: "gold",
  },
  {
    slug: "optical-frames",
    name: "Optical Frames",
    description: "Prescription-ready acetate and metal frames for everyday clarity and style.",
    accent: "ivory",
  },
  {
    slug: "luxury-collection",
    name: "Luxury Collection",
    description: "Limited editions and designer collaborations for the discerning collector.",
    accent: "gold",
  },
  {
    slug: "blue-light",
    name: "Blue Light",
    description: "Screen-ready lenses with refined frames for work, travel, and long days.",
    accent: "blush",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Cases, chains, lens cloths, and care kits to protect your investment.",
    accent: "rose",
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    description: "Curated eyewear gifts for milestones, corporate clients, and special occasions.",
    accent: "ivory",
  },
];
