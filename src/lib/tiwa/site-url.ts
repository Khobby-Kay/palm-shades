/** Canonical site URL (no trailing slash). */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.ADMIN_EMAIL || '';
}
