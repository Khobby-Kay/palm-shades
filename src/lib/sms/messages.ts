import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function smsWelcome(name: string): string {
  const first = name.split(/\s+/)[0] || "there";
  return `${siteConfig.shortName}: Hi ${first}! Welcome to ${siteConfig.name}. Shop, book boutique visits & track orders at ${siteConfig.url.replace(/^https?:\/\//, "")}.`;
}

export function smsOrderReceived(input: {
  orderNumber: string;
  total: number;
  currency: string;
  paid: boolean;
}): string {
  const total = formatPrice(input.total, { currency: input.currency });
  if (input.paid) {
    return `${siteConfig.shortName}: Payment received for order ${input.orderNumber} (${total}). We're preparing your items. Track at ${siteConfig.url}/account/orders`;
  }
  return `${siteConfig.shortName}: Order ${input.orderNumber} received (${total}). Complete payment to confirm — check your email for details.`;
}

export function smsOrderPaid(input: {
  orderNumber: string;
  total: number;
  currency: string;
}): string {
  const total = formatPrice(input.total, { currency: input.currency });
  return `${siteConfig.shortName}: Payment confirmed for order ${input.orderNumber} (${total}). Your order is being prepared. Thank you!`;
}
