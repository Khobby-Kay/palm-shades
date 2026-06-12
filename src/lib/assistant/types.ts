export type AssistantLink = { label: string; href: string };

export type AssistantVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
};

export type AssistantProduct = {
  id: string;
  slug: string;
  name: string;
  productCode: string;
  currency: string;
  price: number;
  imageUrl?: string;
  stock: number;
  variantDimension?: "size" | "inches";
  variants: AssistantVariant[];
};

export type AssistantReply = {
  reply: string;
  intent: string;
  links?: AssistantLink[];
  products?: AssistantProduct[];
  addToCartOffered?: boolean;
};

export type AssistantLogInput = {
  sessionId?: string;
  message: string;
  reply: string;
  intent: string;
  matchedProductSlugs?: string[];
  pagePath?: string;
  userAgent?: string;
  addToCartOffered?: boolean;
};
