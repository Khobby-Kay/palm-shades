/**
 * Verify DATABASE_URL / DIRECT_URL can reach the old MOTCHIS Supabase project.
 * Usage: node scripts/verify-motchis-db.mjs [password]
 */
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

const REF = "lklvlmhqgzfesilpqhnv";
const REGION_HOST = "aws-0-eu-west-1.pooler.supabase.com";

export function lklvlDbUrls(password) {
  const p = encodeURIComponent(password);
  return {
    DATABASE_URL: `postgresql://postgres.${REF}:${p}@${REGION_HOST}:6543/postgres?pgbouncer=true&connection_limit=3`,
    DIRECT_URL: `postgresql://postgres.${REF}:${p}@${REGION_HOST}:5432/postgres`,
  };
}

export async function verifyLklvlPassword(password) {
  const { DIRECT_URL } = lklvlDbUrls(password);
  const client = new pg.Client({
    connectionString: DIRECT_URL,
    connectionTimeoutMillis: 20000,
  });
  try {
    await client.connect();
    await client.query("select 1");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message.split("\n")[0] };
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

const cliPassword =
  process.argv[2]?.trim() ||
  process.env.MOTCHIS_DB_PASSWORD?.trim() ||
  (() => {
    const env = loadEnvLocal();
    const direct = env.DIRECT_URL || "";
    const m = direct.match(/postgres\.lklvlmhqgzfesilpqhnv:([^@]+)@/);
    if (!m) return "";
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return m[1];
    }
  })();

if (!cliPassword) {
  console.error("No password. Pass as arg or set MOTCHIS_DB_PASSWORD / DIRECT_URL in .env");
  process.exit(1);
}

const result = await verifyLklvlPassword(cliPassword);
if (result.ok) {
  console.log(`OK — connected to old MOTCHIS (${REF})`);
  process.exit(0);
}

console.error(`FAIL — cannot connect to ${REF}: ${result.error}`);
console.error(
  "The password must come from Supabase → Project lklvlmhqgzfesilpqhnv → Settings → Database."
);
console.error("Reset the database password there if unsure, then re-run use-old-motchis-env.");
process.exit(1);
