# Tiwa admin on Palm Shades

The Tiwa admin dashboard runs on **Supabase Auth** (`/admin/login`) and reads/writes Tiwa tables (`products`, `orders`, `profiles`, …) via `@supabase/supabase-js`.

The Palm Shades **storefront** still uses **Prisma** (`Product`, `Order`, …) until you migrate catalog data into Tiwa `products` or add a sync layer.

## Local URLs

| Page | URL |
|------|-----|
| Admin login | http://localhost:3000/admin/login |
| Admin dashboard | http://localhost:3000/admin |
| Legacy redirect | http://localhost:3000/admin-signin → `/admin/login` |

## Setup

1. Copy API keys from Supabase project **lklvlmhqgzfesilpqhnv** (old Palm Shades) → **Project Settings → API** into `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. `npm run supabase:migrate` — applies `supabase/migrations/*` to your project DB.
3. `npm run create-admin -- palmshades@gmail.com 'YourPassword'` — creates Supabase Auth user + `profiles.role = admin`.
4. `npm run dev` — open `/admin/login`.

## Storefront sync (Supabase ↔ Prisma)

Admin writes to **Supabase**; the shop reads **Prisma**. Sync keeps them aligned:

| Direction | When |
|-----------|------|
| **Catalog → Prisma** | After product import, `POST /api/admin/sync/catalog`, `npm run sync:catalog`, or cron `GET /api/cron/sync-catalog?secret=…` |
| **Orders → Supabase** | Automatically on checkout and when payment is marked paid |

Requires `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`.

```bash
npm run sync:catalog
```

Prisma rows store `supabaseId` to link uuid ↔ cuid. Prices: Supabase uses GHS (major); Prisma uses pesewas (×100).

## Storage

Create a public bucket **`products`** in Supabase Storage for Tiwa product images (if not created by migration).

## Re-import from Tiwa repo

```bash
npm run import:tiwa-admin
```

Backups of the old Palm Shades admin live under `src/app/_admin-motchis-legacy` and `src/components/_admin-motchis-legacy`.
