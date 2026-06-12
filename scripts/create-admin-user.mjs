/**
 * Create a super admin user in Supabase Auth and set role=admin in profiles.
 * Uses SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local.
 *
 * Usage:
 *   node scripts/create-admin-user.mjs <email> <password>
 * Or set env vars and run:
 *   CREATE_ADMIN_EMAIL=admin@example.com CREATE_ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = { ...process.env, ...loadEnvLocal() };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2] || env.CREATE_ADMIN_EMAIL;
const password = process.argv[3] || env.CREATE_ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env (save the file after pasting keys).'
  );
  if (supabaseUrl && !serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is empty — paste the service_role key from Supabase → Settings → API.');
  }
  process.exit(1);
}

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
  console.error('   Or set CREATE_ADMIN_EMAIL and CREATE_ADMIN_PASSWORD in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureAdminProfile(userId, userEmail) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: userEmail,
      role: 'admin',
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Failed to upsert admin profile:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message?.includes('already been registered')) {
        console.log('User already exists. Resetting password and updating profile to admin...');

        const { data: listed, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) {
          console.error('Failed to list users:', listErr.message);
          process.exit(1);
        }

        const existing = listed.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (!existing) {
          console.error('Auth user exists but could not be found by email:', email);
          process.exit(1);
        }

        const { error: pwdErr } = await supabase.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
        if (pwdErr) {
          console.error('Failed to reset password:', pwdErr.message);
          process.exit(1);
        }

        await ensureAdminProfile(existing.id, existing.email ?? email);
        console.log('Password reset and admin profile ensured. Admin user:', email);
        return;
      }
      console.error('Failed to create user:', createError.message);
      process.exit(1);
    }

    await ensureAdminProfile(user.user.id, user.user.email ?? email);

    console.log('Admin user created successfully.');
    console.log('  Email:', email);
    console.log('  Login at: /admin/login');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
