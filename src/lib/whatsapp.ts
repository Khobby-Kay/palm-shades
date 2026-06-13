import { siteConfig } from "@/lib/site";

/** Build a WhatsApp deep link with optional pre-filled message. */
export function whatsappUrl(message?: string): string {
  const base = siteConfig.socials.whatsapp;
  if (!message?.trim()) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message.trim())}`;
}

export function productWhatsAppMessage(
  productName: string,
  slug: string
): string {
  const url = `${siteConfig.url}/shop/${slug}`;
  return `Hi Palm Shades! I'm interested in the ${productName}. Could you help me with fit and availability?\n\n${url}`;
}

export function bookingWhatsAppMessage(
  serviceName: string,
  dateLabel: string,
  time: string,
  name: string,
  phone: string
): string {
  return `Hi Palm Shades! I'd like to book a fitting:\n\nService: ${serviceName}\nDate: ${dateLabel}\nTime: ${time}\nName: ${name}\nPhone: ${phone}\n\nSent from palmshades.com/book`;
}
