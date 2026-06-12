/**
 * Push production env vars to Vercel from .env.production.local.
 *
 * Prerequisites (run once):
 *   vercel login
 *   vercel link            # select the motchis-house-of-beauty project
 *
 * Usage:
 *   node scripts/push-vercel-env.mjs            # pushes to "production"
 *   node scripts/push-vercel-env.mjs preview    # pushes to "preview"
 *
 * Re-runnable: each variable is removed (if present) then re-added.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2] || "production";
const file = path.join(__dirname, "..", ".env.production.local");

let raw;
try {
  raw = readFileSync(file, "utf8");
} catch {
  console.error("Missing .env.production.local — create it first.");
  process.exit(1);
}

const vars = [];
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 1) continue;
  const name = t.slice(0, i).trim();
  let val = t.slice(i + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  vars.push({ name, val });
}

console.log(`Pushing ${vars.length} variables to "${target}"...\n`);

for (const { name, val } of vars) {
  process.stdout.write(`  ${name} ... `);
  // Remove existing value (ignore errors), then add fresh.
  spawnSync("vercel", ["env", "rm", name, target, "-y"], {
    stdio: ["ignore", "ignore", "ignore"],
    shell: true,
  });
  const res = spawnSync("vercel", ["env", "add", name, target], {
    input: val,
    stdio: ["pipe", "ignore", "pipe"],
    shell: true,
  });
  if (res.status === 0) {
    console.log("ok");
  } else {
    console.log("FAILED");
    if (res.stderr) console.log("    " + res.stderr.toString().trim());
  }
}

console.log("\nDone. Redeploy with:  vercel --prod");
