#!/usr/bin/env node
/**
 * Lightweight security checklist for CI / pre-deploy.
 * Run: npm run security:audit
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const findings = [];

function fail(code, message) {
  findings.push({ level: "FAIL", code, message });
}

function warn(code, message) {
  findings.push({ level: "WARN", code, message });
}

function pass(code, message) {
  findings.push({ level: "PASS", code, message });
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(rel, acc);
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      acc.push(rel);
    }
  }
  return acc;
}

// --- Secrets in repo ---
if (existsSync(join(root, ".env"))) {
  warn("SEC-001", ".env exists locally (ensure it is gitignored and never committed).");
} else {
  pass("SEC-001", ".env not present in workspace root.");
}

const gitignore = existsSync(join(root, ".gitignore")) ? read(".gitignore") : "";
if (!gitignore.includes(".env")) {
  fail("SEC-002", ".gitignore should exclude .env files.");
} else {
  pass("SEC-002", ".env files are gitignored.");
}

// --- Auth secret ---
const example = read(".env.example");
if (!example.includes("AUTH_SECRET")) {
  fail("SEC-003", "AUTH_SECRET documented in .env.example.");
} else {
  pass("SEC-003", "AUTH_SECRET documented.");
}

if (example.includes("connection_limit=1")) {
  fail("SEC-004", "DATABASE_URL must not recommend connection_limit=1.");
} else {
  pass("SEC-004", "DATABASE_URL pool limit looks sane.");
}

// --- Webhook hardening ---
const moolreWebhook = read("src/app/api/webhooks/moolre/route.ts");
if (!moolreWebhook.includes("getPaymentStatus")) {
  fail("SEC-005", "Moolre webhook must verify payment via API before marking paid.");
} else {
  pass("SEC-005", "Moolre webhook verifies with payment API.");
}

const stripeWebhook = read("src/app/api/webhooks/stripe/route.ts");
if (!stripeWebhook.includes('process.env.NODE_ENV === "production"')) {
  warn("SEC-006", "Stripe webhook should reject unsigned payloads in production.");
} else {
  pass("SEC-006", "Stripe webhook production signature check present.");
}

// --- Checkout price validation ---
const checkout = read("src/app/api/checkout/route.ts");
if (!checkout.includes("validateCheckoutCart")) {
  fail("SEC-007", "Checkout must validate cart prices server-side.");
} else {
  pass("SEC-007", "Server-side cart validation enabled.");
}

// --- Order PII access ---
const orderSuccess = read("src/app/checkout/success/[orderNumber]/page.tsx");
if (!orderSuccess.includes("canViewOrderDetails")) {
  fail("SEC-008", "Order success page must gate PII with access token or session.");
} else {
  pass("SEC-008", "Order success page access control enabled.");
}

// --- Rate limiting on public POST routes ---
const publicRoutes = [
  "src/app/api/checkout/route.ts",
  "src/app/api/contact/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/app/api/bookings/route.ts",
];
for (const route of publicRoutes) {
  const src = read(route);
  const name = route.split("/").slice(-2, -1)[0];
  if (!src.includes("enforceRateLimit")) {
    warn("SEC-009", `Rate limit missing on ${name} route.`);
  } else {
    pass("SEC-009", `Rate limit on ${name}.`);
  }
}

// --- Security headers ---
const nextConfig = read("next.config.mjs");
if (!nextConfig.includes("X-Frame-Options")) {
  fail("SEC-010", "Security headers missing from next.config.mjs.");
} else {
  pass("SEC-010", "Security headers configured.");
}

// --- Dangerous patterns ---
const files = walk("src");
let promiseAllPrisma = 0;
for (const file of files) {
  const src = read(file);
  if (/Promise\.all\([\s\S]*?prisma\./.test(src)) promiseAllPrisma += 1;
}
if (promiseAllPrisma > 0) {
  warn("SEC-011", `Found ${promiseAllPrisma} file(s) with Promise.all + prisma (pool risk).`);
} else {
  pass("SEC-011", "No Promise.all + prisma patterns detected.");
}

const fails = findings.filter((f) => f.level === "FAIL");
const warns = findings.filter((f) => f.level === "WARN");

console.log("\nMOTCHIS Security Audit\n" + "=".repeat(40));
for (const f of findings) {
  const icon = f.level === "PASS" ? "✓" : f.level === "WARN" ? "!" : "✗";
  console.log(`${icon} [${f.code}] ${f.message}`);
}
console.log("\n" + "=".repeat(40));
console.log(`Pass: ${findings.filter((f) => f.level === "PASS").length}  Warn: ${warns.length}  Fail: ${fails.length}`);

if (fails.length > 0) {
  process.exit(1);
}
