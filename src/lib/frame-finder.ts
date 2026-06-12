import type { ProductItem } from "@/lib/data/products";
import {
  type FaceShape,
  type FrameUse,
  getFrameMetaOrDefault,
} from "@/lib/data/frame-meta";

export type FinderPriority = "style" | "comfort" | "uv" | "value";

export type FinderAnswers = {
  faceShape: FaceShape;
  primaryUse: FrameUse;
  priority: FinderPriority;
};

export type FinderMatch = {
  product: ProductItem;
  score: number;
  reasons: string[];
};

export function scoreProductsForFinder(
  products: ProductItem[],
  answers: FinderAnswers,
  limit = 6
): FinderMatch[] {
  const scored = products
    .filter((p) => !["accessories", "gift-sets"].includes(p.categorySlug))
    .map((product) => {
      const meta = getFrameMetaOrDefault(product.slug, product.categorySlug);
      let score = 0;
      const reasons: string[] = [];

      if (meta.faceShapes.includes(answers.faceShape)) {
        score += 4;
        reasons.push(`Suits ${answers.faceShape} face shapes`);
      }

      if (meta.bestFor.includes(answers.primaryUse)) {
        score += 3;
        reasons.push(`Built for ${answers.primaryUse.replace("-", " ")}`);
      }

      if (answers.priority === "uv" && meta.polarized) {
        score += 2;
        reasons.push("Polarized for Accra sun");
      }
      if (answers.priority === "uv" && meta.uvProtection === "UV400") {
        score += 1;
      }

      if (answers.priority === "comfort" && meta.frameStyle === "rimless") {
        score += 2;
        reasons.push("Lightweight rimless comfort");
      }
      if (answers.priority === "comfort" && meta.templeMm <= 140) {
        score += 1;
      }

      if (answers.priority === "style" && product.isBestSeller) {
        score += 2;
        reasons.push("Client favourite");
      }
      if (answers.priority === "style" && product.categorySlug === "luxury-collection") {
        score += 1;
      }

      if (answers.priority === "value" && product.compareAtPrice) {
        score += 2;
        reasons.push("On sale now");
      }
      if (answers.priority === "value" && product.price < 150000) {
        score += 1;
      }

      if (product.isBestSeller) score += 1;
      if (product.isNew) score += 0.5;

      return { product, score, reasons: reasons.slice(0, 3) };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
