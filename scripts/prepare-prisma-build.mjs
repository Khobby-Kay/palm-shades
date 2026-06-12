/**
 * Run Prisma migrations only when a database URL is configured.
 * Allows Vercel builds to succeed with static catalog fallback (no Supabase yet).
 */
import { spawnSync } from "node:child_process";

const hasDb =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (!hasDb) {
  console.log("[prepare-prisma-build] no DATABASE_URL — skipping prisma migrate deploy");
  process.exit(0);
}

const res = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});

process.exit(res.status ?? 1);
