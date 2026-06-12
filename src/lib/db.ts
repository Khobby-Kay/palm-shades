/** True when Prisma can connect (set DATABASE_URL in Vercel / .env). */
export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (url.includes("replace-me") || url.includes("<password>")) return false;
  return true;
}
