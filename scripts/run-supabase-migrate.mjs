#!/usr/bin/env node
/** Apply supabase/migrations using DIRECT_URL from .env (no Supabase CLI login required). */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env, ...loadEnvLocal() };
const dbUrl = env.DIRECT_URL?.trim();

if (!dbUrl) {
  console.error("Set DIRECT_URL in .env (Session pooler, port 5432).");
  process.exit(1);
}

// Supabase CLI also reads SUPABASE_DB_PASSWORD for some auth paths.
const passMatch = dbUrl.match(/postgres\.[^:]+:([^@]+)@/);
if (passMatch) {
  try {
    env.SUPABASE_DB_PASSWORD = decodeURIComponent(passMatch[1]);
  } catch {
    env.SUPABASE_DB_PASSWORD = passMatch[1];
  }
}

console.log("→ Applying supabase/migrations via db push…");
const r = spawnSync("npx", ["supabase", "db", "push", "--db-url", dbUrl, "--yes"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});

process.exit(r.status ?? 1);
