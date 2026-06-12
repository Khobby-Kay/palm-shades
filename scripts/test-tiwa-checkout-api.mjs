import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnv() {
  const raw = readFileSync(".env", "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const base = env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const { data: product } = await admin
  .from("products")
  .select("id, slug, name, price")
  .limit(1)
  .maybeSingle();

if (!product) {
  console.error("No active Supabase product found for test");
  process.exit(1);
}

const res = await fetch(`${base}/api/checkout/tiwa`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Test",
    lastName: "Buyer",
    email: "test-buyer@motchis.test",
    phone: "233242149489",
    deliveryMethod: "pickup",
    items: [
      {
        id: product.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Math.round(Number(product.price) * 100),
        quantity: 1,
      },
    ],
  }),
});

const json = await res.json();
console.log("status:", res.status);
console.log("body:", JSON.stringify(json, null, 2));

if (json.orderNumber) {
  await admin.from("orders").delete().eq("order_number", json.orderNumber);
  console.log("cleaned up", json.orderNumber);
}
