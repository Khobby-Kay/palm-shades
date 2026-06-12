import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvLocal, projectRefFromUrl } from './load-env-local.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnvLocal();
const ref =
  process.env.SUPABASE_PROJECT_REF ||
  projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);

if (!ref) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL in .env.local or SUPABASE_PROJECT_REF.');
  process.exit(1);
}

const r = spawnSync('npx', ['supabase', 'link', '--project-ref', ref], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
});

process.exit(r.status ?? 1);
