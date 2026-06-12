import { siteConfig } from "@/lib/site";

/** Shared Palm Shades branding for admin printouts (orders, POS receipts, etc.). */
export const adminPrintBrand = {
  name: siteConfig.name,
  shortName: siteConfig.shortName,
  tagline: siteConfig.brand.story.logoTagline,
  address: siteConfig.contact.address,
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  siteLabel: siteConfig.url.replace(/^https?:\/\//, ""),
} as const;

export const ADMIN_PRINT_MEDIA_CSS = `
@media print {
  body * { visibility: hidden; }
  .print-section, .print-section * { visibility: visible; }
  .print-section {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
    background: white;
  }
  .no-print { display: none !important; }
}
`;
