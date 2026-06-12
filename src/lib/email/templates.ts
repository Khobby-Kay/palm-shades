import { emailLayout } from "./layout";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/orders";
import { siteConfig } from "@/lib/site";
import { orderSuccessUrl } from "@/lib/security/order-access";

// ---------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------

interface OrderEmailInput {
  orderNumber: string;
  fullName: string;
  email: string;
  total: number;
  subtotal: number;
  shipping: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingRegion?: string | null;
  shippingCountry: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export function orderConfirmationEmail(o: OrderEmailInput) {
  const itemRows = o.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#1a1418;">${escape(it.name)} <span style="color:#7a6a70;">× ${it.quantity}</span></td>
        <td align="right" style="padding:10px 0;font-size:14px;color:#1a1418;white-space:nowrap;">${escape(formatPrice(it.price * it.quantity, { currency: o.currency }))}</td>
      </tr>`
    )
    .join("");

  const paid = o.paymentStatus === "PAID";

  const intro = paid
    ? `Hi ${o.fullName.split(" ")[0]}, thank you for your order! We're already getting your beautiful little parcel ready.`
    : `Hi ${o.fullName.split(" ")[0]}, we've received your order. Please complete payment using the instructions below and we'll dispatch it right away.`;

  const body = `
    <p style="margin:0 0 20px;color:#4a3c42;">Order <strong style="color:#1a1418;">${escape(o.orderNumber)}</strong></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      ${itemRows}
      <tr><td colspan="2" style="border-top:1px solid #fce7ef;padding-top:14px;"></td></tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a6a70;">Subtotal</td>
        <td align="right" style="padding:6px 0;font-size:13px;color:#1a1418;">${escape(formatPrice(o.subtotal, { currency: o.currency }))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a6a70;">Shipping</td>
        <td align="right" style="padding:6px 0;font-size:13px;color:#1a1418;">${o.shipping === 0 ? "Free" : escape(formatPrice(o.shipping, { currency: o.currency }))}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:0.16em;color:#7a6a70;">Total</td>
        <td align="right" style="padding:12px 0 0;font-family:'Georgia','Times New Roman',serif;font-size:24px;color:#1a1418;">${escape(formatPrice(o.total, { currency: o.currency }))}</td>
      </tr>
    </table>

    <div style="margin-top:28px;padding:18px 20px;border-radius:18px;background:#fff4f8;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#e891b0;">Delivery to</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#1a1418;">
        ${escape(o.fullName)}<br/>
        ${escape(o.shippingLine1)}${o.shippingLine2 ? `, ${escape(o.shippingLine2)}` : ""}<br/>
        ${escape(o.shippingCity)}${o.shippingRegion ? `, ${escape(o.shippingRegion)}` : ""}<br/>
        ${escape(o.shippingCountry)}
      </p>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#4a3c42;">
      Payment method: <strong style="color:#1a1418;">${escape(paymentMethodLabel(o.paymentMethod))}</strong>
      &nbsp;&middot;&nbsp;
      Status: <strong style="color:${paid ? "#15803d" : "#e891b0"};">${escape(o.paymentStatus)}</strong>
    </p>
  `;

  return {
    subject: paid
      ? `${siteConfig.shortName} — We've got your order · ${o.orderNumber}`
      : `${siteConfig.shortName} — Order received · ${o.orderNumber}`,
    html: emailLayout({
      preview: `Your Palm Shades order ${o.orderNumber} is confirmed.`,
      heading: paid ? "Your order is on its way" : "We've received your order",
      intro,
      body,
      cta: {
        label: "View order details",
        href: orderSuccessUrl(siteConfig.url, o.orderNumber, o.email),
      },
      footerNote: "Need anything? Just reply to this email — we read every one.",
    }),
    text: [
      `Hi ${o.fullName.split(" ")[0]},`,
      "",
      paid
        ? "Thank you for your order!"
        : "We've received your order. Please complete payment using the instructions on your order page.",
      "",
      `Order: ${o.orderNumber}`,
      `Total: ${formatPrice(o.total, { currency: o.currency })}`,
      `Payment: ${paymentMethodLabel(o.paymentMethod)} (${o.paymentStatus})`,
      "",
      `View your order: ${orderSuccessUrl(siteConfig.url, o.orderNumber, o.email)}`,
      "",
      "— Palm Shades",
    ].join("\n"),
  };
}

// ---------------------------------------------------------------
// Booking confirmation
// ---------------------------------------------------------------

interface BookingEmailInput {
  bookingId: string;
  serviceName: string;
  guestName: string;
  date: Date;
  startTime: string;
  durationMin: number;
  location: string;
  address?: string | null;
  childName?: string | null;
  notes?: string | null;
  total: number;
  currency: string;
}

export function bookingConfirmationEmail(b: BookingEmailInput) {
  const dateStr = b.date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const locationLabel =
    b.location === "HOME_SERVICE"
      ? "Home service (2× boutique rate)"
      : "In-boutique at our Pantang–Abokobi studio";

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:14px 0;font-size:13px;color:#7a6a70;">Service</td>
        <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${escape(b.serviceName)}</td>
      </tr>
      <tr><td colspan="2" style="border-top:1px solid #fce7ef;"></td></tr>
      <tr>
        <td style="padding:14px 0;font-size:13px;color:#7a6a70;">Date &amp; time</td>
        <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${escape(dateStr)} · ${escape(b.startTime)}</td>
      </tr>
      <tr><td colspan="2" style="border-top:1px solid #fce7ef;"></td></tr>
      <tr>
        <td style="padding:14px 0;font-size:13px;color:#7a6a70;">Duration</td>
        <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${b.durationMin} minutes</td>
      </tr>
      <tr><td colspan="2" style="border-top:1px solid #fce7ef;"></td></tr>
      <tr>
        <td style="padding:14px 0;font-size:13px;color:#7a6a70;">Location</td>
        <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${escape(locationLabel)}</td>
      </tr>
      ${
        b.location === "HOME_SERVICE" && b.address
          ? `<tr><td colspan="2" style="border-top:1px solid #fce7ef;"></td></tr>
             <tr>
               <td style="padding:14px 0;font-size:13px;color:#7a6a70;">Address</td>
               <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${escape(b.address)}</td>
             </tr>`
          : ""
      }
      ${
        b.childName
          ? `<tr><td colspan="2" style="border-top:1px solid #fce7ef;"></td></tr>
             <tr>
               <td style="padding:14px 0;font-size:13px;color:#7a6a70;">For</td>
               <td align="right" style="padding:14px 0;font-size:14px;color:#1a1418;">${escape(b.childName)}</td>
             </tr>`
          : ""
      }
      <tr><td colspan="2" style="border-top:1px solid #fce7ef;padding-top:14px;"></td></tr>
      <tr>
        <td style="padding:12px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.16em;color:#7a6a70;">From</td>
        <td align="right" style="padding:12px 0;font-family:'Georgia','Times New Roman',serif;font-size:24px;color:#1a1418;">${escape(formatPrice(b.total, { currency: b.currency }))}</td>
      </tr>
    </table>

    ${
      b.notes
        ? `<div style="margin-top:20px;padding:16px 18px;border-radius:16px;background:#fff4f8;">
             <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#e891b0;">Your note</p>
             <p style="margin:0;font-size:14px;line-height:1.6;color:#1a1418;">${escape(b.notes)}</p>
           </div>`
        : ""
    }

    <p style="margin:24px 0 0;font-size:13px;color:#4a3c42;">
      A team member will reach out within one business day to confirm your appointment and answer any prep questions.
    </p>
  `;

  return {
    subject: `${siteConfig.shortName} — Appointment received · ${b.serviceName}`,
    html: emailLayout({
      preview: `Your Palm Shades appointment for ${b.serviceName} is being prepared.`,
      heading: "Your chair is reserved",
      intro: `Hi ${b.guestName.split(" ")[0]}, thank you for booking with Palm Shades. Here are your appointment details.`,
      body,
      footerNote: "Need to change anything? Reply to this email and we'll take care of it.",
    }),
    text: [
      `Hi ${b.guestName.split(" ")[0]},`,
      "",
      `Your appointment for ${b.serviceName} has been received.`,
      `Date: ${dateStr} at ${b.startTime}`,
      `Duration: ${b.durationMin} minutes`,
      `Location: ${locationLabel}`,
      `Total: ${formatPrice(b.total, { currency: b.currency })}`,
      "",
      "We'll be in touch shortly to confirm.",
      "",
      "— Palm Shades",
    ].join("\n"),
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------
// Welcome / account created
// ---------------------------------------------------------------

export function welcomeAccountEmail(input: { name: string; email: string }) {
  const first = input.name.split(/\s+/)[0] || "there";

  const body = `
    <p style="margin:0 0 16px;color:#4a3c42;line-height:1.6;">
      Your account is ready. You can shop our boutique, book boutique appointments,
      and track orders from one place.
    </p>
    <ul style="margin:0;padding-left:20px;color:#4a3c42;line-height:1.8;font-size:14px;">
      <li>Browse wigs, hair care &amp; beauty essentials</li>
      <li>Book braids, makeup, nails &amp; more</li>
      <li>Save guest profiles for faster booking</li>
    </ul>
  `;

  return {
    subject: `Welcome to ${siteConfig.shortName}`,
    html: emailLayout({
      preview: `Welcome to Palm Shades, ${first}.`,
      heading: `Welcome, ${escape(first)}`,
      intro: `Thanks for joining Palm Shades — we're glad you're here.`,
      body,
      cta: {
        label: "Start shopping",
        href: `${siteConfig.url}/shop`,
      },
      footerNote: "Questions? Reply to this email anytime.",
    }),
    text: [
      `Hi ${first},`,
      "",
      `Welcome to ${siteConfig.name}!`,
      "",
      `Shop: ${siteConfig.url}/shop`,
      `Book: ${siteConfig.url}/book`,
      `Your account: ${siteConfig.url}/account`,
      "",
      "— Palm Shades",
    ].join("\n"),
  };
}
