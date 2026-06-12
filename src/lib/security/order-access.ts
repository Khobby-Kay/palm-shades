import crypto from "crypto";
import type { Session } from "next-auth";

function accessSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for order access tokens");
  return secret;
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", accessSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 32);
}

/** Signed token proving the holder placed or owns the order. */
export function createOrderAccessToken(orderNumber: string, email: string): string {
  return signPayload(`order:${orderNumber.toLowerCase()}:${email.toLowerCase()}`);
}

export function verifyOrderAccessToken(
  orderNumber: string,
  email: string,
  token: string | null | undefined
): boolean {
  if (!token || token.length !== 32) return false;
  const expected = createOrderAccessToken(orderNumber, email);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function orderSuccessPath(orderNumber: string, email: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ token: createOrderAccessToken(orderNumber, email) });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
  }
  return `/checkout/success/${encodeURIComponent(orderNumber)}?${params.toString()}`;
}

export function orderSuccessUrl(
  siteUrl: string,
  orderNumber: string,
  email: string,
  extra?: Record<string, string>
): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${orderSuccessPath(orderNumber, email, extra)}`;
}

export function canViewOrderDetails(
  order: { userId: string | null; email: string; orderNumber: string },
  session: Session | null,
  accessToken: string | null | undefined
): boolean {
  if (session?.user?.id && order.userId && session.user.id === order.userId) return true;
  if (
    session?.user?.email &&
    session.user.email.toLowerCase() === order.email.toLowerCase()
  ) {
    return true;
  }
  return verifyOrderAccessToken(order.orderNumber, order.email, accessToken);
}

export function createBookingAccessToken(bookingId: string, guestEmail: string): string {
  return signPayload(`booking:${bookingId}:${guestEmail.toLowerCase()}`);
}

export function verifyBookingAccessToken(
  bookingId: string,
  guestEmail: string,
  token: string | null | undefined
): boolean {
  if (!token || token.length !== 32) return false;
  const expected = createBookingAccessToken(bookingId, guestEmail);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function bookingSuccessPath(bookingId: string, guestEmail: string): string {
  const token = createBookingAccessToken(bookingId, guestEmail);
  return `/book/success/${encodeURIComponent(bookingId)}?token=${token}`;
}
