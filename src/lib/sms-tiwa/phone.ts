/** Mask phone numbers in logs (from tiwa lib/notifications.ts). */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return "***";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

/**
 * Format Ghana mobile numbers to E.164 (+233XXXXXXXXX).
 * Ported from tiwa lib/notifications.ts formatPhoneNumber().
 */
export function formatTiwaSmsPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "233" + cleaned.slice(1);
  }

  if (cleaned.length === 9) {
    cleaned = "233" + cleaned;
  }

  if (!cleaned.startsWith("233")) return null;

  return `+${cleaned}`;
}
