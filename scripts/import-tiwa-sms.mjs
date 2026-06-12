#!/usr/bin/env node
/**
 * Copy Tiwa Moolre SMS stack into src/lib/sms-tiwa/ (standalone — does not touch Hubtel or notifications).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TIWA =
  process.env.TIWA_ROOT || "C:\\Users\\LENOVO\\Downloads\\my Repo\\tiwa-main";

const DEST = path.join(ROOT, "src", "lib", "sms-tiwa");
const DOC_DEST = path.join(ROOT, "docs", "SMS_TIWA.md");

function exists(p) {
  return fs.existsSync(p);
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, content) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content);
}

if (!exists(TIWA)) {
  console.error("Tiwa repo not found:", TIWA);
  console.error("Set TIWA_ROOT to your tiwa-main folder.");
  process.exit(1);
}

const tiwaNotifications = path.join(TIWA, "lib", "notifications.ts");
const tiwaTestActions = path.join(TIWA, "app", "admin", "test-sms", "actions.ts");
const tiwaStatus = path.join(TIWA, "SMS_INTEGRATION_STATUS.md");

if (!exists(tiwaNotifications)) {
  console.error("Missing tiwa lib/notifications.ts");
  process.exit(1);
}

console.log("→ Reading tiwa SMS from:", TIWA);

// Preserve hand-maintained module files; refresh docs + snapshot from tiwa.
if (exists(tiwaStatus)) {
  const doc = read(tiwaStatus);
  const header = `# Tiwa / Moolre SMS (standalone)\n\n> Auto-imported notes from tiwa \`SMS_INTEGRATION_STATUS.md\`. Runtime code lives in \`src/lib/sms-tiwa/\`.\n\n`;
  write(DOC_DEST, header + doc);
  console.log("→ Updated docs/SMS_TIWA.md from tiwa SMS_INTEGRATION_STATUS.md");
}

const snapshotDir = path.join(DEST, "_tiwa-source");
mkdirp(snapshotDir);

for (const [label, src] of [
  ["notifications.ts", tiwaNotifications],
  ["test-sms-actions.ts", tiwaTestActions],
  ["SMS_INTEGRATION_STATUS.md", tiwaStatus],
]) {
  if (!exists(src)) {
    console.warn("skip (missing):", src);
    continue;
  }
  const dest = path.join(snapshotDir, label);
  write(dest, read(src));
  console.log("→ Snapshot:", path.relative(ROOT, dest));
}

console.log(`
Done. Tiwa SMS snapshots saved under src/lib/sms-tiwa/_tiwa-source/
App code to use: import from @/lib/sms-tiwa

Add to .env when ready:
  MOOLRE_SMS_API_KEY=your_vas_key
  MOOLRE_SMS_SENDER_ID=MOTCHIS
`);
