#!/usr/bin/env node
/**
 * Push non-secret email/SMS env vars to Vercel production.
 * Secrets (SMTP_PASS, HUBTEL_*) must be added manually:
 *   vercel env add SMTP_PASS production
 *   vercel env add HUBTEL_CLIENT_ID production
 *   vercel env add HUBTEL_CLIENT_SECRET production
 */
import { execSync } from "node:child_process";

const VARS = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "motchishouseofbeauty@gmail.com",
  SMS_PROVIDER: "hubtel",
  HUBTEL_SENDER_ID: "MOTCHIS",
};

function setVercelEnv(key, value) {
  console.log(`\n→ ${key}`);
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

console.log("Setting Vercel production notification env (non-secrets)…");
for (const [key, value] of Object.entries(VARS)) {
  setVercelEnv(key, value);
}

console.log(`
Done. Add secrets on Vercel (Project → Settings → Environment Variables):
  SMTP_PASS          — Gmail App Password (https://myaccount.google.com/apppasswords)
  HUBTEL_CLIENT_ID   — Hubtel dashboard → API keys
  HUBTEL_CLIENT_SECRET

Then redeploy: vercel deploy --prod --yes
`);
