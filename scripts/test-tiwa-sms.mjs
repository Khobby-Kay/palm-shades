#!/usr/bin/env node
/**
 * Send a test SMS via Moolre (tiwa provider). Requires MOOLRE_SMS_API_KEY in .env.
 *
 * Usage: npm run test:tiwa-sms -- 024XXXXXXX "Hello"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function formatPhone(phone) {
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "233" + cleaned.slice(1);
  if (cleaned.length === 9) cleaned = "233" + cleaned;
  if (!cleaned.startsWith("233")) return null;
  return "+" + cleaned;
}

loadEnvFile();

const phone = process.argv[2];
const message = process.argv[3] || "Test SMS from MOTCHIS (tiwa/Moolre module)";

const vasKey =
  process.env.MOOLRE_SMS_API_KEY?.trim() ||
  process.env.MOOLRE_API_KEY?.trim();

if (!vasKey) {
  console.error("Missing MOOLRE_SMS_API_KEY (or MOOLRE_API_KEY) in .env");
  process.exit(1);
}

if (!phone) {
  console.error("Usage: npm run test:tiwa-sms -- 024XXXXXXX \"Your message\"");
  process.exit(1);
}

const recipient = formatPhone(phone);
if (!recipient) {
  console.error("Invalid phone:", phone);
  process.exit(1);
}

const senderId = process.env.MOOLRE_SMS_SENDER_ID?.trim() || "MOTCHIS";

console.log("Sending to", recipient, "sender:", senderId);

const res = await fetch("https://api.moolre.com/open/sms/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-VASKEY": vasKey,
  },
  body: JSON.stringify({
    type: 1,
    senderid: senderId,
    messages: [{ recipient, message }],
  }),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = { rawResponse: text };
}

console.log(JSON.stringify({ httpStatus: res.status, recipient, result: json }, null, 2));
process.exit(json?.status === 1 ? 0 : 1);
