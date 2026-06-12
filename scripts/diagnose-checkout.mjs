import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

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
const base = env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
const prisma = new PrismaClient();

console.log("=== Checkout diagnostic ===\n");
console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Service role set:", !!env.SUPABASE_SERVICE_ROLE_KEY);
console.log("Moolre user set:", !!env.MOOLRE_API_USER);
console.log("Test base URL:", base);

const { data: sbProducts, error: sbErr } = await admin
  .from("products")
  .select("id, slug, name, price")
  .limit(10);

if (sbErr) {
  console.error("Supabase products error:", sbErr.message);
} else {
  console.log("\nSupabase products:", sbProducts?.length ?? 0);
  for (const p of sbProducts ?? []) {
    console.log(`  SB  slug=${p.slug} id=${p.id}`);
  }
}

const prismaProducts = await prisma.product.findMany({
  where: { isActive: true },
  select: { id: true, slug: true, name: true, supabaseId: true, price: true },
  take: 10,
});

console.log("\nPrisma products:", prismaProducts.length);
const mismatches = [];
for (const p of prismaProducts) {
  const sb = sbProducts?.find((s) => s.slug === p.slug);
  const linked = p.supabaseId ? "linked" : "NO supabaseId";
  const inSb = sb ? "in SB" : "MISSING in SB";
  console.log(`  PR  slug=${p.slug} ${linked} ${inSb}`);
  if (!sb && !p.supabaseId) mismatches.push(p);
}

if (mismatches.length > 0) {
  console.log("\n⚠ Cart items using these Prisma slugs will FAIL checkout:");
  for (const p of mismatches) console.log(`   - ${p.name} (${p.slug})`);
}

const testProduct = prismaProducts[0] || sbProducts?.[0];
if (!testProduct) {
  console.error("\nNo products to test checkout with");
  process.exit(1);
}

const slug = testProduct.slug;
const priceMinor = Math.round(Number(testProduct.price ?? sbProducts?.[0]?.price ?? 0));

console.log("\n--- Testing /api/checkout/tiwa with slug:", slug, "---");
const res = await fetch(`${base}/api/checkout/tiwa`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Test",
    lastName: "Buyer",
    email: "diag@test.motchis.local",
    phone: "233242149489",
    deliveryMethod: "pickup",
    items: [
      {
        id: testProduct.id,
        productId: testProduct.id,
        slug,
        name: testProduct.name || slug,
        price: priceMinor,
        quantity: 1,
      },
    ],
  }),
});

const json = await res.json();
console.log("HTTP", res.status, JSON.stringify(json, null, 2));

if (json.orderNumber) {
  await admin.from("orders").delete().eq("order_number", json.orderNumber);
  console.log("Cleaned up test order", json.orderNumber);
}

await prisma.$disconnect();
