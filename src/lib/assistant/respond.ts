import { getAssistantProductIndex, type AssistantProductIndex } from "@/lib/assistant/catalog";
import { siteConfig } from "@/lib/site";
import type { AssistantProduct, AssistantReply } from "@/lib/assistant/types";

function toAssistantProduct(p: AssistantProductIndex): AssistantProduct {
  const { shortDesc: _s, categorySlug: _c, ...product } = p;
  return product;
}

function scoreProducts(message: string, products: AssistantProductIndex[]) {
  const lower = message.toLowerCase();
  const tokens = lower.split(/\s+/).filter((t) => t.length > 2);

  return products
    .map((p) => {
      const hay = `${p.name} ${p.shortDesc} ${p.categorySlug}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { product: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function wantsAddToCart(message: string) {
  return /\b(add|buy|order|get|want|need|cart|purchase)\b/i.test(message);
}

function needsProductSearch(message: string) {
  const trimmed = message.trim().toLowerCase();
  if (wantsAddToCart(message)) return true;
  if (/^(hi|hello|hey|thanks|thank you|ok|okay|help)[\s!.?]*$/i.test(trimmed)) {
    return false;
  }
  return trimmed.split(/\s+/).some((t) => t.length > 2);
}

export async function buildAssistantReply(message: string): Promise<AssistantReply> {
  const lower = message.toLowerCase();

  if (/book|fitting|appointment|optician|prescription|eye exam/.test(lower)) {
    return {
      intent: "booking",
      reply: `Book a private frame fitting at ${siteConfig.url}/book — lens consultation, adjustments, and styling. Call ${siteConfig.contact.phone} for same-day visits.`,
      links: [{ label: "Book a fitting", href: "/book" }],
    };
  }

  if (/ship|deliver|pickup|accra|osu/.test(lower)) {
    return {
      intent: "shipping",
      reply:
        "Complimentary boutique pickup in Osu, Accra, and insured delivery across Ghana. Delivery fees for doorstep orders are confirmed at checkout.",
      links: [
        { label: "Shipping policy", href: "/policies/shipping" },
        { label: "Contact us", href: "/contact" },
      ],
    };
  }

  if (/pay|moolre|mobile money|momo|checkout/.test(lower)) {
    return {
      intent: "payment",
      reply:
        "Checkout supports Mobile Money (Moolre) for secure payment. Add frames to your cart, complete checkout, and you'll be guided through payment.",
      links: [
        { label: "Browse shop", href: "/shop" },
        { label: "View cart", href: "/cart" },
      ],
    };
  }

  if (/polarized|lens|blue light|prescription|uv/.test(lower)) {
    return {
      intent: "lenses",
      reply:
        "We offer polarized sun lenses, blue-light filtering, and prescription-ready optical frames. Book a fitting for personalized lens guidance.",
      links: [
        { label: "Book a fitting", href: "/book" },
        { label: "Shop optical frames", href: "/shop?category=optical-frames" },
      ],
    };
  }

  if (!needsProductSearch(message)) {
    return fallbackReply();
  }

  const products = await getAssistantProductIndex();
  const matches = scoreProducts(message, products);
  const addIntent = wantsAddToCart(message);

  if (matches.length > 0) {
    const assistantProducts = matches.map((m) => toAssistantProduct(m.product));
    const names = assistantProducts.map((p) => p.name).join(", ");

    if (addIntent) {
      return {
        intent: "add_to_cart",
        addToCartOffered: true,
        reply: `I found ${assistantProducts.length === 1 ? "this frame" : "these frames"}: ${names}. Choose your option if shown, then tap Add to cart.`,
        products: assistantProducts,
        links: assistantProducts.map((p) => ({
          label: `View ${p.name}`,
          href: `/shop/${p.slug}`,
        })),
      };
    }

    return {
      intent: "products",
      reply: `Here are some frames that match: ${names}. View details or say "add [frame] to cart".`,
      products: assistantProducts,
      addToCartOffered: true,
      links: assistantProducts.map((p) => ({
        label: p.name,
        href: `/shop/${p.slug}`,
      })),
    };
  }

  return fallbackReply();
}

function fallbackReply(): AssistantReply {
  return {
    intent: "fallback",
    reply: `I'm the ${siteConfig.shortName} assistant. Ask about sunglasses, optical frames, lens options, fittings, delivery, or payment — or say "add [frame] to cart".`,
    links: [
      { label: "Browse shop", href: "/shop" },
      { label: "Book a fitting", href: "/book" },
      { label: "FAQ", href: "/faq" },
    ],
  };
}
