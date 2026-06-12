/** Normalize Ghana mobile numbers to E.164 without + (233XXXXXXXXX). */
export function normalizeGhPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  if (digits.length === 9 && /^[235]/.test(digits)) return `233${digits}`;
  return null;
}

export function formatSmsPhone(phone: string | null | undefined): string | null {
  const normalized = normalizeGhPhone(phone);
  return normalized ? `+${normalized}` : null;
}
