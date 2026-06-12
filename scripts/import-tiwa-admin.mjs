#!/usr/bin/env node
/**
 * Copy Tiwa admin stack into MOTCHIS (src/ layout) and rewrite @/lib/* imports.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TIWA = process.env.TIWA_ROOT || "C:\\Users\\LENOVO\\Downloads\\my Repo\\tiwa-main";

const IMPORT_MAP = [
  ["@/lib/supabase-admin", "@/lib/tiwa/supabase-admin"],
  ["@/lib/supabase", "@/lib/tiwa/supabase"],
  ["@/lib/notifications", "@/lib/tiwa/notifications"],
  ["@/lib/query-cache", "@/lib/tiwa/query-cache"],
  ["@/lib/rate-limit", "@/lib/tiwa/rate-limit"],
  ["@/lib/recaptcha", "@/lib/tiwa/recaptcha"],
  ["@/lib/sanitize", "@/lib/tiwa/sanitize"],
  ["@/lib/site-url", "@/lib/tiwa/site-url"],
  ["@/lib/auth", "@/lib/tiwa/auth"],
  ["@/lib/import/", "@/lib/tiwa/import/"],
];

function exists(p) {
  return fs.existsSync(p);
}

function rmrf(dir) {
  if (!exists(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest, { rewrite = true } = {}) {
  if (!exists(src)) {
    console.warn("skip (missing):", src);
    return;
  }
  mkdirp(dest);
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name);
    const d = path.join(dest, name.name);
    if (name.isDirectory()) copyDir(s, d, { rewrite });
    else {
      mkdirp(path.dirname(d));
      let content = fs.readFileSync(s, "utf8");
      if (rewrite && /\.(tsx?|mjs|jsx?)$/.test(name.name)) {
        for (const [from, to] of IMPORT_MAP) {
          content = content.split(from).join(to);
        }
      }
      fs.writeFileSync(d, content);
    }
  }
}

function copyFile(src, dest, { rewrite = true } = {}) {
  if (!exists(src)) {
    console.warn("skip (missing):", src);
    return;
  }
  mkdirp(path.dirname(dest));
  let content = fs.readFileSync(src, "utf8");
  if (rewrite && /\.(tsx?|mjs|jsx?)$/.test(path.basename(src))) {
    for (const [from, to] of IMPORT_MAP) {
      content = content.split(from).join(to);
    }
  }
  fs.writeFileSync(dest, content);
}

if (!exists(TIWA)) {
  console.error("Tiwa repo not found:", TIWA);
  process.exit(1);
}

// Backup existing MOTCHIS admin
const legacyAdmin = path.join(ROOT, "src", "app", "_admin-motchis-legacy");
const legacyComponents = path.join(ROOT, "src", "components", "_admin-motchis-legacy");
if (exists(path.join(ROOT, "src", "app", "admin")) && !exists(legacyAdmin)) {
  try {
    console.log("→ Backing up src/app/admin → _admin-motchis-legacy");
    fs.renameSync(path.join(ROOT, "src", "app", "admin"), legacyAdmin);
  } catch {
    console.warn("→ Backup skipped (folder in use); overwriting admin files in place");
  }
}
if (exists(path.join(ROOT, "src", "components", "admin")) && !exists(legacyComponents)) {
  try {
    console.log("→ Backing up src/components/admin → _admin-motchis-legacy");
    fs.renameSync(path.join(ROOT, "src", "components", "admin"), legacyComponents);
  } catch {
    console.warn("→ Backup skipped (folder in use); overwriting admin components in place");
  }
}

const jobs = [
  ["app/admin", "src/app/admin"],
  ["app/api/admin", "src/app/api/admin"],
  ["app/api/payment", "src/app/api/payment"],
  ["app/api/notifications", "src/app/api/notifications"],
  ["app/api/cron", "src/app/api/cron"],
  ["app/api/storefront", "src/app/api/storefront"],
  ["app/api/recaptcha", "src/app/api/recaptcha"],
  ["components/admin", "src/components/admin"],
  ["supabase/migrations", "supabase/migrations"],
  ["hooks/useRecaptcha.ts", "src/hooks/useRecaptcha.ts"],
  ["hooks/usePageTitle.ts", "src/hooks/usePageTitle.ts"],
];

for (const [from, to] of jobs) {
  const src = path.join(TIWA, from);
  const dest = path.join(ROOT, to);
  console.log("→", from);
  if (from.endsWith(".ts")) copyFile(src, dest);
  else copyDir(src, dest);
}

// lib → src/lib/tiwa
mkdirp(path.join(ROOT, "src", "lib", "tiwa"));
for (const name of fs.readdirSync(path.join(TIWA, "lib"))) {
  const src = path.join(TIWA, "lib", name);
  const dest = path.join(ROOT, "src", "lib", "tiwa", name);
  if (fs.statSync(src).isDirectory()) copyDir(src, dest);
  else copyFile(src, dest);
}

// scripts
for (const script of [
  "create-admin-user.mjs",
  "supabase-link.mjs",
  "load-env-local.mjs",
  "provision-supabase.mjs",
]) {
  copyFile(path.join(TIWA, "scripts", script), path.join(ROOT, "scripts", script), {
    rewrite: false,
  });
}

// supabase config
if (exists(path.join(TIWA, "supabase", "config.toml"))) {
  copyFile(path.join(TIWA, "supabase", "config.toml"), path.join(ROOT, "supabase", "config.toml"), {
    rewrite: false,
  });
}

console.log("\nDone. Run npm install, then supabase:migrate and create-admin.");
