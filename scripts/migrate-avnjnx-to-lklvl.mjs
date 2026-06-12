/**
 * Copy storefront + admin data from avnjnxmnmlxnvkewuudh → lklvlmhqgzfesilpqhnv.
 *
 * Usage:
 *   MOTCHIS_DB_PASSWORD='...' node scripts/migrate-avnjnx-to-lklvl.mjs
 *   node scripts/migrate-avnjnx-to-lklvl.mjs --dry-run
 */
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

const PASS = encodeURIComponent(
  process.env.MOTCHIS_DB_PASSWORD?.trim() ||
    process.env.SOURCE_DB_PASSWORD?.trim() ||
    (() => {
      const env = loadEnvLocal();
      const m = env.DIRECT_URL?.match(/postgres\.[^:]+:([^@]+)@/);
      if (!m) return "";
      try {
        return decodeURIComponent(m[1]);
      } catch {
        return m[1];
      }
    })()
);

if (!PASS) {
  console.error("Set MOTCHIS_DB_PASSWORD (works for both projects if passwords match).");
  process.exit(1);
}

const SOURCE = `postgresql://postgres.avnjnxmnmlxnvkewuudh:${PASS}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`;
const TARGET = `postgresql://postgres.lklvlmhqgzfesilpqhnv:${PASS}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;

const DRY = process.argv.includes("--dry-run");

/** auth.users lives outside public — skip profiles; re-run create-admin after migrate. */
const SKIP_TABLES = new Set(["profiles"]);

/** Nullable FK columns when auth users cannot be copied between projects. */
const NULLABLE_FKS = {
  orders: ["user_id"],
  customers: ["user_id"],
};

/** Prisma (PascalCase) + Tiwa (snake_case) tables, parents before children. */
const TABLE_ORDER = [
  "Category",
  "categories",
  "User",
  "profiles",
  "Service",
  "Product",
  "products",
  "ProductVariant",
  "product_variants",
  "ProductImage",
  "product_images",
  "GalleryItem",
  "SiteBanner",
  "Review",
  "reviews",
  "Address",
  "addresses",
  "ChildProfile",
  "Account",
  "Session",
  "VerificationToken",
  "Order",
  "orders",
  "OrderItem",
  "order_items",
  "order_status_history",
  "Booking",
  "WishlistItem",
  "wishlist_items",
  "NewsletterSubscriber",
  "ContactMessage",
  "contact_submissions",
  "coupons",
  "customers",
  "store_settings",
  "site_settings",
  "cms_content",
  "banners",
  "blog_posts",
  "notifications",
];

function quoteTable(name) {
  return /^[A-Z]/.test(name) ? `"${name}"` : name;
}

async function tableExists(client, name) {
  const r = await client.query(
    `select 1 from information_schema.tables where table_schema = 'public' and table_name = $1`,
    [name]
  );
  return r.rowCount > 0;
}

async function rowCount(client, name) {
  const r = await client.query(`select count(*)::int as c from ${quoteTable(name)}`);
  return r.rows[0].c;
}

async function copyTable(src, tgt, name) {
  const q = quoteTable(name);
  const colsRes = await src.query(
    `select column_name, data_type, udt_name
     from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [name]
  );
  if (!colsRes.rowCount) return { name, skipped: "no columns" };

  const columns = colsRes.rows.map((c) => c.column_name);
  const colList = columns.map((c) => `"${c}"`).join(", ");

  const data = await src.query(`select ${colList} from ${q}`);
  if (!data.rowCount) return { name, rows: 0 };

  const nullCols = NULLABLE_FKS[name] ?? [];
  const rows = data.rows.map((row) => {
    if (!nullCols.length) return row;
    const copy = { ...row };
    for (const col of nullCols) copy[col] = null;
    return copy;
  });

  if (DRY) return { name, rows: rows.length, dryRun: true };

  await tgt.query(`truncate ${q} cascade`);

  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch
      .map(
        (_, ri) =>
          `(${columns.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(", ")})`
      )
      .join(", ");
    const values = batch.flatMap((row) => columns.map((c) => row[c]));
    await tgt.query(`insert into ${q} (${colList}) values ${placeholders}`, values);
    inserted += batch.length;
  }

  return { name, rows: inserted };
}

const src = new pg.Client({ connectionString: SOURCE, connectionTimeoutMillis: 30000 });
const tgt = new pg.Client({ connectionString: TARGET, connectionTimeoutMillis: 30000 });

try {
  await src.connect();
  await tgt.connect();
  console.log("Connected: avnjnx (source) → lklvl (target)");
  if (DRY) console.log("DRY RUN — no writes\n");

  const summary = [];
  for (const table of TABLE_ORDER) {
    if (SKIP_TABLES.has(table)) {
      console.log(`${table}: skipped (auth.users not portable — run create-admin after)`);
      continue;
    }
    if (!(await tableExists(src, table))) continue;
    if (!(await tableExists(tgt, table))) {
      summary.push({ table, skipped: "missing on target" });
      continue;
    }
    const srcRows = await rowCount(src, table);
    if (srcRows === 0) continue;
    try {
      const result = await copyTable(src, tgt, table);
      summary.push(result);
      console.log(
        `${result.name}: ${result.rows ?? 0} rows${result.dryRun ? " (dry)" : ""}${result.skipped ? ` — ${result.skipped}` : ""}`
      );
    } catch (e) {
      summary.push({ table, error: e.message.split("\n")[0] });
      console.error(`${table}: FAILED — ${e.message.split("\n")[0]}`);
    }
  }

  console.log("\nDone.");
  const errors = summary.filter((s) => s.error);
  if (errors.length) process.exit(1);
} catch (e) {
  console.error(e.message);
  process.exit(1);
} finally {
  await src.end().catch(() => {});
  await tgt.end().catch(() => {});
}
