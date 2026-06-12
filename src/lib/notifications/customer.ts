import { sendEmail, EMAIL_ADMIN } from "@/lib/email/client";
import {
  orderConfirmationEmail,
  welcomeAccountEmail,
} from "@/lib/email/templates";
import { sendSms } from "@/lib/sms/client";
import {
  smsOrderPaid,
  smsOrderReceived,
  smsWelcome,
} from "@/lib/sms/messages";

type OrderNotifyInput = {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
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
};

function orderEmailPayload(input: OrderNotifyInput) {
  return orderConfirmationEmail({
    orderNumber: input.orderNumber,
    fullName: input.fullName,
    email: input.email,
    total: input.total,
    subtotal: input.subtotal,
    shipping: input.shipping,
    currency: input.currency,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    shippingLine1: input.shippingLine1,
    shippingLine2: input.shippingLine2 ?? null,
    shippingCity: input.shippingCity,
    shippingRegion: input.shippingRegion ?? null,
    shippingCountry: input.shippingCountry,
    items: input.items,
  });
}

/** Order placed (pending or paid) — email + SMS to customer, email to admin. */
export function notifyOrderPlaced(input: OrderNotifyInput): void {
  const tmpl = orderEmailPayload(input);
  const paid = input.paymentStatus === "PAID";

  void sendEmail({ to: input.email, ...tmpl });
  void sendEmail({
    to: EMAIL_ADMIN,
    subject: `[Palm Shades] New order · ${input.orderNumber}`,
    html: tmpl.html,
    text: tmpl.text,
  });

  void sendSms({
    to: input.phone,
    message: smsOrderReceived({
      orderNumber: input.orderNumber,
      total: input.total,
      currency: input.currency,
      paid,
    }),
  });
}

/** Payment confirmed — email + SMS (idempotent callers should guard duplicate sends). */
export function notifyOrderPaid(input: OrderNotifyInput): void {
  const paidInput = { ...input, paymentStatus: "PAID" as const };
  const tmpl = orderEmailPayload(paidInput);

  void sendEmail({ to: input.email, ...tmpl });
  void sendEmail({
    to: EMAIL_ADMIN,
    subject: `[Palm Shades] Payment received · ${input.orderNumber}`,
    html: tmpl.html,
    text: tmpl.text,
  });

  void sendSms({
    to: input.phone,
    message: smsOrderPaid({
      orderNumber: input.orderNumber,
      total: input.total,
      currency: input.currency,
    }),
  });
}

/** New account — welcome email + SMS. */
export function notifyAccountCreated(input: {
  name: string;
  email: string;
  phone: string;
}): void {
  const tmpl = welcomeAccountEmail(input);

  void sendEmail({ to: input.email, ...tmpl });
  void sendSms({ to: input.phone, message: smsWelcome(input.name) });
}
