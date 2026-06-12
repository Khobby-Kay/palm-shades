#!/usr/bin/env node
/**
 * Smoke-test email + SMS using current .env (or production env vars).
 * Usage:
 *   node scripts/test-notifications.mjs you@example.com 0242149489
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

function loadEnv() {
  try {
    const text = readFileSync(".env", "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i);
      let v = t.slice(i + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (process.env[k] === undefined) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const emailTo = process.argv[2]?.trim();
const phoneTo = process.argv[3]?.trim();

if (!emailTo) {
  console.error("Usage: node scripts/test-notifications.mjs <email> [phone]");
  process.exit(1);
}

const host = process.env.SMTP_HOST?.trim();
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const from =
  process.env.EMAIL_FROM ?? "MOTCHIS House of Beauty <motchishouseofbeauty@gmail.com>";

console.log("\n--- Email ---");
if (!host || !user || !pass) {
  console.log("SKIP: set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
} else {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  try {
    const info = await transport.sendMail({
      from,
      to: emailTo,
      subject: "[MOTCHIS] Notification test",
      text: "If you received this, Gmail SMTP is working.",
      html: "<p>If you received this, <strong>Gmail SMTP</strong> is working.</p>",
    });
    console.log("OK:", info.messageId);
  } catch (err) {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

console.log("\n--- SMS ---");
if (!phoneTo) {
  console.log("SKIP: pass a Ghana phone as the second argument");
} else {
  const provider = (process.env.SMS_PROVIDER ?? "hubtel").toLowerCase();
  const clientId = process.env.HUBTEL_CLIENT_ID?.trim();
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET?.trim();

  if (provider === "dry-run" || provider === "off" || !clientId || !clientSecret) {
    console.log("SKIP: set SMS_PROVIDER=hubtel and HUBTEL_CLIENT_ID / HUBTEL_CLIENT_SECRET");
  } else {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const digits = phoneTo.replace(/\D/g, "");
    const fromId = process.env.HUBTEL_SENDER_ID?.trim() || "MOTCHIS";
    try {
      const res = await fetch("https://smsc.hubtel.com/v1/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          From: fromId,
          To: digits,
          Content: "MOTCHIS test SMS — notifications are working.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("FAIL:", data.message ?? data.status ?? res.status);
        process.exitCode = 1;
      } else {
        console.log("OK:", data.MessageId ?? data.messageId ?? data.status ?? "sent");
      }
    } catch (err) {
      console.error("FAIL:", err instanceof Error ? err.message : err);
      process.exitCode = 1;
    }
  }
}

console.log("");
