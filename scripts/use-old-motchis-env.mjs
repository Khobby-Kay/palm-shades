/**
 * Point local + Vercel production at the original MOTCHIS Supabase project
 * (ref: lklvlmhqgzfesilpqhnv, region: aws-0-eu-west-1).
 *
 * Usage:
 *   MOTCHIS_DB_PASSWORD='your-db-password' SUPABASE_SERVICE_ROLE_KEY='your-key' node scripts/use-old-motchis-env.mjs
 *   node scripts/use-old-motchis-env.mjs --vercel-only
 *   node scripts/use-old-motchis-env.mjs --local-only
 *
 * DB password: https://supabase.com/dashboard/project/lklvlmhqgzfesilpqhnv/settings/database
 * API keys:    https://supabase.com/dashboard/project/lklvlmhqgzfesilpqhnv/settings/api
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lklvlDbUrls, verifyLklvlPassword } from "./verify-motchis-db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const REF = "lklvlmhqgzfesilpqhnv";
const REGION_HOST = "aws-0-eu-west-1.pooler.supabase.com";
const SUPABASE_URL = `https://${REF}.supabase.co`;
const PRODUCTION_SITE = "https://motchis-house-of-beauty.vercel.app";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrbHZsbWhxZ3pmZXNpbHBxaG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTI5NTEsImV4cCI6MjA5NTEyODk1MX0._HURU6AHh64yR2Eiwoig5mxCzUJ0zr9crVp3mL4yKE0";

const args = new Set(process.argv.slice(2));
const vercelOnly = args.has("--vercel-only");
const localOnly = args.has("--local-only");

const dbPassword = process.env.MOTCHIS_DB_PASSWORD?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const dbUrls = lklvlDbUrls;

function patchEnvFile(filePath, replacements) {
  let text = readFileSync(filePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    const line = `${key}="${value}"`;
    if (new RegExp(`^${key}=`, "m").test(text)) {
      text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
    } else {
      text += `\n${line}\n`;
    }
  }
  writeFileSync(filePath, text);
}

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
}

const supabaseVars = {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY: ANON_KEY,
  POSTGRES_HOST: `db.${REF}.supabase.co`,
  POSTGRES_USER: "postgres",
  POSTGRES_DATABASE: "postgres",
};

if (dbPassword) {
  const check = await verifyLklvlPassword(dbPassword);
  if (!check.ok) {
    console.error(`\nDatabase password rejected for old MOTCHIS (${REF}):`);
    console.error(`  ${check.error}`);
    console.error(
      "\nThe password you used works on the other project (avnjnxmnmlxnvkewuudh), not lklvl."
    );
    console.error(
      "Reset it here: https://supabase.com/dashboard/project/lklvlmhqgzfesilpqhnv/settings/database"
    );
    console.error("Then re-run with the new MOTCHIS_DB_PASSWORD. Vercel was NOT updated.");
    process.exit(1);
  }
  console.log(`Verified DB password for ${REF}`);
}

if (!vercelOnly) {
  const localPath = path.join(ROOT, ".env");
  const localPatch = { ...supabaseVars };
  if (dbPassword) Object.assign(localPatch, dbUrls(dbPassword));
  if (serviceRole) localPatch.SUPABASE_SERVICE_ROLE_KEY = serviceRole;
  patchEnvFile(localPath, localPatch);
  console.log(`Updated ${localPath}`);
}

if (!localOnly) {
  console.log('\nUpdating Vercel production env for old MOTCHIS...');
  for (const [k, v] of Object.entries(supabaseVars)) vercelSet(k, v);
  vercelSet("AUTH_URL", PRODUCTION_SITE);
  vercelSet("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE);
  vercelSet("AUTH_TRUST_HOST", "true");
  if (process.env.AUTH_SECRET?.trim()) {
    vercelSet("AUTH_SECRET", process.env.AUTH_SECRET.trim());
  }
  if (dbPassword) {
    for (const [k, v] of Object.entries(dbUrls(dbPassword))) vercelSet(k, v);
  } else {
    for (const k of ["DATABASE_URL", "DIRECT_URL"]) {
      process.stdout.write(`  rm ${k} (use Vercel Supabase POSTGRES_* integration) ... `);
      const res = spawnSync("vercel", ["env", "rm", k, "production", "-y"], {
        stdio: ["ignore", "ignore", "pipe"],
        shell: true,
      });
      console.log(res.status === 0 ? "ok" : "skip");
    }
  }
  if (serviceRole) {
    vercelSet("SUPABASE_SERVICE_ROLE_KEY", serviceRole);
  } else {
    process.stdout.write("  rm SUPABASE_SERVICE_ROLE_KEY ... ");
    const res = spawnSync("vercel", ["env", "rm", "SUPABASE_SERVICE_ROLE_KEY", "production", "-y"], {
      stdio: ["ignore", "ignore", "pipe"],
      shell: true,
    });
    console.log(res.status === 0 ? "ok" : "skip");
    console.log(
      "  (add SUPABASE_SERVICE_ROLE_KEY from lklvl dashboard for admin + storefront Supabase APIs)"
    );
  }
  console.log("\nRedeploy: vercel --prod --yes");
}

if (!dbPassword || !serviceRole) {
  console.log(
    "\nStill needed from Supabase dashboard (project lklvlmhqgzfesilpqhnv):"
  );
  if (!dbPassword) console.log("  - MOTCHIS_DB_PASSWORD (Settings → Database)");
  if (!serviceRole) console.log("  - SUPABASE_SERVICE_ROLE_KEY (Settings → API)");
}
