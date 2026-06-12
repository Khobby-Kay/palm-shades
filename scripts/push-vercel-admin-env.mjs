/**
 * Push Supabase + auth env vars required for /admin/login on Vercel production.
 * Does not require DB password (admin sign-in uses Supabase Auth, not Prisma).
 */
import { spawnSync } from "node:child_process";

const REF = "lklvlmhqgzfesilpqhnv";
const SUPABASE_URL = `https://${REF}.supabase.co`;
const PRODUCTION_SITE = "https://motchis-house-of-beauty.vercel.app";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrbHZsbWhxZ3pmZXNpbHBxaG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTI5NTEsImV4cCI6MjA5NTEyODk1MX0._HURU6AHh64yR2Eiwoig5mxCzUJ0zr9crVp3mL4yKE0";

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const authSecret = process.env.AUTH_SECRET?.trim();

function vercelSet(name, value) {
  process.stdout.write(`  ${name} ... `);
  spawnSync("vercel", ["env", "rm", name, "production", "-y"], {
    stdio: "ignore",
    shell: true,
  });
  const res = spawnSync("vercel", ["env", "add", name, "production"], {
    input: value,
    stdio: ["pipe", "ignore", "pipe"],
    shell: true,
  });
  console.log(res.status === 0 ? "ok" : "FAILED");
  if (res.status !== 0 && res.stderr) {
    console.log("    " + res.stderr.toString().trim());
  }
  return res.status === 0;
}

const vars = {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY: ANON_KEY,
  AUTH_URL: PRODUCTION_SITE,
  NEXT_PUBLIC_SITE_URL: PRODUCTION_SITE,
  AUTH_TRUST_HOST: "true",
};

console.log("Pushing Vercel production env for admin login (lklvl)...\n");

let ok = true;
for (const [k, v] of Object.entries(vars)) {
  if (!vercelSet(k, v)) ok = false;
}

if (serviceRole) {
  if (!vercelSet("SUPABASE_SERVICE_ROLE_KEY", serviceRole)) ok = false;
} else {
  console.error("\nMissing SUPABASE_SERVICE_ROLE_KEY in environment.");
  ok = false;
}

if (authSecret) {
  vercelSet("AUTH_SECRET", authSecret);
}

console.log(
  ok
    ? "\nDone. Redeploy required: vercel --prod --yes"
    : "\nSome variables failed — check Vercel CLI login."
);
process.exit(ok ? 0 : 1);
