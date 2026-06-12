/**
 * Map Vercel Supabase integration vars → Prisma env names when DATABASE_URL is unset.
 * Safe locally: only fills missing DATABASE_URL / DIRECT_URL.
 */
const updates = {};

if (!process.env.DATABASE_URL?.trim()) {
  const pooled =
    process.env.POSTGRES_PRISMA_URL?.trim() || process.env.POSTGRES_URL?.trim();
  if (pooled) {
    process.env.DATABASE_URL = pooled;
    updates.DATABASE_URL = "POSTGRES_PRISMA_URL|POSTGRES_URL";
  }
}

if (!process.env.DIRECT_URL?.trim()) {
  const direct =
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.POSTGRES_URL?.trim();
  if (direct) {
    process.env.DIRECT_URL = direct;
    updates.DIRECT_URL = "POSTGRES_URL_NON_POOLING|POSTGRES_URL";
  }
}

if (Object.keys(updates).length > 0) {
  console.log(
    `[resolve-database-env] filled: ${Object.entries(updates)
      .map(([k, v]) => `${k}<=${v}`)
      .join(", ")}`
  );
}
