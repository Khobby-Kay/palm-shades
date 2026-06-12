/**
 * Create a Supabase project for TIWAA and write API keys to .env.local.
 *
 * Prerequisite: npx supabase login  (or set SUPABASE_ACCESS_TOKEN)
 *
 * Usage: node scripts/provision-supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { readAccessToken } from './load-env-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');
const PROJECT_NAME = 'tiwaa-perfume-style-house';

const token = readAccessToken();
if (!token) {
  console.error('No Supabase access token. Run: npx supabase login');
  console.error('Or set SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function api(pathname, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${pathname}: ${JSON.stringify(data)}`);
  }
  return data;
}

function upsertEnvLocal(updates) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(ENV_PATH, content.endsWith('\n') ? content : `${content}\n`);
}

const orgs = await api('/organizations');
const org = orgs?.[0];
if (!org?.slug && !org?.id) {
  console.error('No Supabase organization found on this account.');
  process.exit(1);
}

const dbPass = crypto.randomBytes(24).toString('base64url');
console.log(`Creating project "${PROJECT_NAME}" in org ${org.slug || org.name}...`);

const created = await api('/projects', {
  method: 'POST',
  body: JSON.stringify({
    name: PROJECT_NAME,
    organization_slug: org.slug,
    organization_id: org.id,
    db_pass: dbPass,
    region: 'us-east-1',
  }),
});

const ref = created.id || created.ref;
if (!ref) throw new Error(`Unexpected create response: ${JSON.stringify(created)}`);

console.log(`Project ref: ${ref}. Waiting for API keys...`);

let anonKey = '';
let serviceKey = '';
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  try {
    const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
    const list = Array.isArray(keys) ? keys : keys?.api_keys || [];
    for (const k of list) {
      if (k.name === 'anon' || k.type === 'anon' || k.name === 'publishable') {
        anonKey = k.api_key || k.key || anonKey;
      }
      if (k.name === 'service_role' || k.type === 'service_role' || k.name === 'secret') {
        serviceKey = k.api_key || k.key || serviceKey;
      }
    }
    if (anonKey && serviceKey) break;
  } catch {
    // project still provisioning
  }
}

if (!anonKey || !serviceKey) {
  console.log('Project created but keys not ready. Fetch from dashboard → Settings → API.');
  console.log(`https://supabase.com/dashboard/project/${ref}/settings/api`);
  upsertEnvLocal({
    NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
    SUPABASE_DB_PASSWORD: dbPass,
  });
  process.exit(0);
}

upsertEnvLocal({
  NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  SUPABASE_DB_PASSWORD: dbPass,
});

console.log('Updated .env.local with Supabase credentials.');
console.log(`Dashboard: https://supabase.com/dashboard/project/${ref}`);
console.log('Next: npm run supabase:migrate');
