/**
 * Bulk rebrand remaining MOTCHIS strings → Palm Shades.
 * Run once: node scripts/rebrand-remaining.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const REPLACEMENTS = [
  ["MOTCHIS House of Beauty", "Palm Shades"],
  ["MOTCHIS Beauty", "Palm Shades"],
  ["MOTCHIS Salon Accra", "Palm Shades Accra"],
  ["MOTCHIS", "Palm Shades"],
  ["motchishouseofbeauty@gmail.com", "hello@palmshades.com"],
  ["motchisbeauty", "palmshades"],
  ["Forever Gorgeous", "See Luxury Clearly"],
  ["motchis-logo", "palm-shades-logo"],
  ["motchis-build", "palm-shades-build"],
  ["MOTCHIS-cart", "palm-shades-cart"],
  ["MOTCHIS-wishlist", "palm-shades-wishlist"],
  ["motchis-assistant", "palm-shades-assistant"],
  ["motchis-chunk", "palm-shades-chunk"],
  ["motchis-static", "palm-shades-static"],
  ["motchis-pages", "palm-shades-pages"],
  ["motchis-images", "palm-shades-images"],
  ["Wholesale & retail of all your beauty needs", "Curated luxury eyewear"],
  ["Book an Appointment", "Book a Fitting"],
  ["Book appointment", "Book fitting"],
  ["salon", "boutique"],
];

const EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".html",
  ".sql",
]);

const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXT.has(path.extname(name))) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file.includes("rebrand-remaining.mjs")) continue;
  let text = fs.readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log(`Updated ${changed} files.`);
