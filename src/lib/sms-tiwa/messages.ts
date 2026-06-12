/**
 * SMS copy templates from tiwa lib/notifications.ts.
 * Brand name / URLs come from env so Palm Shades can override Tiwa defaults later.
 */

function brandName(): string {
  return (
    process.env.MOOLRE_SMS_BRAND_NAME?.trim() ||
    process.env.NEXT_PUBLIC_SITE_NAME?.trim() ||
    "Palm Shades"
  );
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function tiwaSmsOrderConfirmed(input: {
  name: string;
  orderNumber: string;
  trackingNumber?: string;
  trackingUrl: string;
  shippingNotes?: string[];
}): string {
  const notes =
    input.shippingNotes && input.shippingNotes.length > 0
      ? ` Note: ${input.shippingNotes.join("; ")}.`
      : "";

  if (input.trackingNumber) {
    return `Hi ${input.name}, your order #${input.orderNumber} is confirmed! Tracking: ${input.trackingNumber}. Track here: ${input.trackingUrl}${notes}`;
  }

  return `Hi ${input.name}, your order #${input.orderNumber} at ${brandName()} is confirmed! Track here: ${input.trackingUrl}${notes}`;
}

export function tiwaSmsOrderStatusUpdate(input: {
  name: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl: string;
}): string {
  const { name, orderNumber, status, trackingNumber, trackingUrl } = input;

  if (status === "shipped") {
    return trackingNumber
      ? `Good news ${name}! Order #${orderNumber} has been packaged. Tracking: ${trackingNumber}. Track: ${trackingUrl}`
      : `Good news ${name}! Order #${orderNumber} has been packaged. Track: ${trackingUrl}`;
  }

  if (status === "delivered") {
    return `Hi ${name}, your order #${orderNumber} has been delivered. Enjoy your purchase!`;
  }

  if (status === "processing") {
    return trackingNumber
      ? `Hi ${name}, your order #${orderNumber} is being processed. Tracking: ${trackingNumber}. Track: ${trackingUrl}`
      : `Hi ${name}, your order #${orderNumber} is being processed. Track: ${trackingUrl}`;
  }

  return `Hi ${name}, order #${orderNumber} status: ${status}. Track: ${trackingUrl}`;
}

export function tiwaSmsWelcome(firstName: string): string {
  return `Welcome ${firstName}! Thanks for joining ${brandName()}.`;
}

export function tiwaSmsPaymentLink(input: {
  name: string;
  orderNumber: string;
  total: number;
  paymentUrl: string;
}): string {
  return `Hi ${input.name}, complete your order #${input.orderNumber} (GH₵${Number(input.total).toFixed(2)}) here: ${input.paymentUrl}`;
}

export function tiwaSmsTrackingUrl(orderNumber: string): string {
  return `${siteUrl()}/order-tracking?order=${orderNumber}`;
}

export function tiwaSmsBookingConfirmed(input: {
  name: string;
  serviceName: string;
  date: Date;
  startTime: string;
  locationLabel: string;
  totalMajor: number;
  currency?: string;
}): string {
  const dateStr = input.date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currency = input.currency || "GHS";
  return `Hi ${input.name}, your ${input.serviceName} appointment at ${brandName()} is booked for ${dateStr} at ${input.startTime} (${input.locationLabel}). From ${currency} ${input.totalMajor.toFixed(2)}. We'll confirm shortly.`;
}

export function tiwaSmsOrderPlaced(input: {
  name: string;
  orderNumber: string;
  total: number;
  paymentUrl?: string;
}): string {
  const base = `Hi ${input.name}, thanks for your order #${input.orderNumber} at ${brandName()} (GH₵${Number(input.total).toFixed(2)}).`;
  if (input.paymentUrl) {
    return `${base} Complete payment: ${input.paymentUrl}`;
  }
  return `${base} We'll notify you when it's ready. Track: ${tiwaSmsTrackingUrl(input.orderNumber)}`;
}

export function tiwaSmsAdminNewBooking(input: {
  guestName: string;
  serviceName: string;
  date: Date;
  startTime: string;
  locationLabel: string;
  totalMajor: number;
}): string {
  const dateStr = input.date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  return `New booking: ${input.guestName} · ${input.serviceName} · ${dateStr} ${input.startTime} · ${input.locationLabel} · GH₵${input.totalMajor.toFixed(2)}`;
}

export function tiwaSmsAdminNewOrder(input: {
  orderNumber: string;
  customerName: string;
  total: number;
}): string {
  return `New order #${input.orderNumber} from ${input.customerName} · GH₵${Number(input.total).toFixed(2)}. Check admin dashboard.`;
}
