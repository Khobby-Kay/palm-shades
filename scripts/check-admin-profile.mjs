import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env-local.mjs";

const env = { ...process.env, ...loadEnvLocal() };
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2] ?? "motchisbeauty@gmail.com";
const { data: listed, error } = await supabase.auth.admin.listUsers();
if (error) {
  console.error(error.message);
  process.exit(1);
}

const user = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.log("NO_AUTH_USER", email);
  process.exit(1);
}

const { data: profile, error: pErr } = await supabase
  .from("profiles")
  .select("id, role, email")
  .eq("id", user.id)
  .maybeSingle();

console.log(
  JSON.stringify(
    {
      project: env.NEXT_PUBLIC_SUPABASE_URL,
      userId: user.id,
      email: user.email,
      profile,
      profileError: pErr?.message ?? null,
    },
    null,
    2
  )
);
