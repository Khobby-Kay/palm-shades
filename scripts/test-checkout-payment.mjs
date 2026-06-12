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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(url, service);
const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const { data: inserted, error: insErr } = await admin
  .from("orders")
  .insert({
    order_number: orderNumber,
    user_id: null,
    email: "test@test.com",
    phone: "233000000000",
    status: "pending",
    payment_status: "pending",
    currency: "GHS",
    subtotal: 10,
    tax_total: 0,
    shipping_total: 0,
    discount_total: 0,
    total: 10,
    shipping_method: "doorstep",
    payment_method: "moolre",
    shipping_address: { city: "Accra" },
    billing_address: { city: "Accra" },
    metadata: {},
  })
  .select("id, order_number, total")
  .single();

console.log("admin insert:", insErr?.message ?? "ok", inserted?.order_number);

const anonOrder = `ORD-ANON-${Date.now()}`;
const { error: anonErr } = await anon
  .from("orders")
  .insert({
    order_number: anonOrder,
    user_id: null,
    email: "guest@test.com",
    phone: "233000000000",
    status: "pending",
    payment_status: "pending",
    currency: "GHS",
    subtotal: 10,
    tax_total: 0,
    shipping_total: 0,
    discount_total: 0,
    total: 10,
    shipping_method: "pickup",
    payment_method: "moolre",
    shipping_address: {
      firstName: "A",
      lastName: "B",
      email: "guest@test.com",
      phone: "233",
      address: "x",
      city: "Accra",
      region: "Greater Accra",
    },
    billing_address: { firstName: "A", lastName: "B" },
    metadata: {},
  })
  .select("id")
  .single();
console.log("anon insert:", anonErr?.message ?? "ok");
if (!anonErr) {
  const { data: anonFound } = await admin
    .from("orders")
    .select("order_number")
    .eq("order_number", anonOrder)
    .maybeSingle();
  console.log("anon order visible to admin:", !!anonFound);
  await admin.from("orders").delete().eq("order_number", anonOrder);
}

const { data: found, error: findErr } = await admin
  .from("orders")
  .select("id, order_number, total")
  .eq("order_number", orderNumber)
  .maybeSingle();

console.log("lookup:", findErr?.message ?? "ok", found?.order_number);

const base = env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
const payRes = await fetch(`${base}/api/payment/moolre`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: orderNumber,
    customerEmail: "test@test.com",
  }),
});
const payJson = await payRes.json();
console.log("payment api:", payRes.status, payJson.message || payJson.success);

if (inserted?.id) {
  await admin.from("orders").delete().eq("id", inserted.id);
  console.log("cleaned up test order");
}
