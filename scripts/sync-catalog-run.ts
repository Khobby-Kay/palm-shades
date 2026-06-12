import { loadEnvLocal } from "./load-env-local.mjs";

Object.assign(process.env, { ...process.env, ...loadEnvLocal() });

async function main() {
  const { syncCatalogFromSupabase } = await import(
    "../src/lib/sync/catalog-from-supabase"
  );
  const result = await syncCatalogFromSupabase();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
