import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";

function parseEnvFile(path) {
  const out = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v) out[k] = v;
  }
  return out;
}

function bumpConnectionLimit(url, limit = 3) {
  if (/connection_limit=\d+/.test(url)) {
    return url.replace(/connection_limit=\d+/, `connection_limit=${limit}`);
  }
  return url + (url.includes("?") ? "&" : "?") + `connection_limit=${limit}`;
}

function writeLocalEnvPatch(key, value) {
  try {
    let text = readFileSync(".env", "utf8");
    const line = `${key}="${value}"`;
    if (new RegExp(`^${key}=`, "m").test(text)) {
      text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
    } else {
      text += `\n${line}\n`;
    }
    writeFileSync(".env", text);
  } catch {
    /* optional */
  }
}

const pulled = parseEnvFile(".env.vercel.tmp");
const local = parseEnvFile(".env");

const dbUrl =
  pulled.DATABASE_URL ||
  pulled.POSTGRES_PRISMA_URL ||
  local.DATABASE_URL ||
  local.POSTGRES_PRISMA_URL;

if (!dbUrl) {
  console.error("Could not resolve DATABASE_URL from .env.vercel.tmp or .env");
  process.exit(1);
}

const newDbUrl = bumpConnectionLimit(dbUrl, 3);
const moolreSecret =
  pulled.MOOLRE_WEBHOOK_SECRET ||
  local.MOOLRE_WEBHOOK_SECRET ||
  randomBytes(32).toString("hex");

const updates = [];
updates.push({ key: "DATABASE_URL", value: newDbUrl });
if (!pulled.MOOLRE_WEBHOOK_SECRET && !local.MOOLRE_WEBHOOK_SECRET) {
  updates.push({ key: "MOOLRE_WEBHOOK_SECRET", value: moolreSecret });
}

const stripeStatus =
  pulled.STRIPE_WEBHOOK_SECRET || local.STRIPE_WEBHOOK_SECRET ? "set" : "missing";

console.log(
  JSON.stringify(
    {
      connectionLimitBefore: dbUrl.match(/connection_limit=(\d+)/)?.[1] ?? "none",
      connectionLimitAfter: "3",
      updates: updates.map((u) => u.key),
      stripeWebhookSecret: stripeStatus,
      moolreWebhookSecretAdded: updates.some((u) => u.key === "MOOLRE_WEBHOOK_SECRET"),
    },
    null,
    2
  )
);

for (const { key, value } of updates) {
  console.log(`\n→ Vercel production: ${key}`);
  try {
    execSync(`vercel env rm ${key} production --yes`, { stdio: "inherit" });
  } catch {
    /* first add */
  }
  execSync(`vercel env add ${key} production`, {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

writeLocalEnvPatch("DATABASE_URL", newDbUrl);
if (updates.some((u) => u.key === "MOOLRE_WEBHOOK_SECRET")) {
  writeLocalEnvPatch("MOOLRE_WEBHOOK_SECRET", moolreSecret);
}

console.log("\n→ Redeploying production…");
execSync("vercel deploy --prod --yes", { stdio: "inherit" });
