# Supabase setup for Palm Shades

The app uses **PostgreSQL** via Prisma. Supabase hosts the database; Vercel runs the Next.js app.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose a name, password, and region (pick one close to your users, e.g. EU or US).
3. Wait until the project is ready.

## 2. Copy connection strings

In Supabase: **Project Settings → Database → Connection string**

| Variable | Supabase mode | Port | Used for |
|----------|---------------|------|----------|
| `DATABASE_URL` | **Transaction** pooler | **6543** | App runtime (Vercel, `next dev`) |
| `DIRECT_URL` | **Session** (direct) | **5432** | `prisma migrate`, `db push`, seed |

Append to the pooled URL (if not already present):

```
?pgbouncer=true&connection_limit=1
```

Replace `[YOUR-PASSWORD]` with your database password.

**This project’s Supabase host (already in `.env.example`):**

| | Value |
|--|--------|
| Pooler host | `aws-0-eu-west-1.pooler.supabase.com` |
| User | `postgres.lklvlmhqgzfesilpqhnv` |
| `DATABASE_URL` port | `6543` (transaction pooler) |
| `DIRECT_URL` port | `5432` (session pooler) |

## 3. Local `.env`

```bash
cp .env.example .env
```

Paste both URLs into `.env`, then:

```bash
npm run db:migrate:deploy   # applies prisma/migrations to Supabase
npm run db:seed             # optional demo data + admin user
npm run dev
```

If migrate fails, try:

```bash
npm run db:push
npm run db:seed
```

## 4. Vercel environment variables

In Vercel: **Project → Settings → Environment Variables**

Add for **Production** (and Preview if you use it):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Pooled Supabase URL (port 6543) |
| `DIRECT_URL` | Direct Supabase URL (port 5432) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-domain.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |

Redeploy after saving. The build no longer prerenders admin pages without a database, but **runtime still requires `DATABASE_URL`** for orders, bookings, auth, and admin.

## 4b. Admin image uploads (product photos)

Admin **Upload file** saves images to cloud storage — no manual URL needed.

**Option A — Vercel Blob (recommended on Vercel)**

1. Vercel → your project → **Storage** → **Blob** → **Create store**
2. Choose **Private** (default) or **Public** — both work with this app
3. Link the store to `motchis-house-of-beauty`
4. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically
5. For **private** stores (default): add env `BLOB_ACCESS=private` (or leave unset — app defaults to private)
6. For **public** stores: add env `BLOB_ACCESS=public`
7. Redeploy

Private stores save images via `/api/media/blob?pathname=...` so they display on the shop without a public blob URL.

**Option B — Supabase Storage**

1. Supabase → **Project Settings → API** → copy **service_role** key (keep secret)
2. Add to Vercel env: `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy — the app creates a public `product-images` bucket on first upload

Local dev without either key saves files to `public/uploads/products/`.

## 5. First deploy checklist

- [ ] Supabase project created  
- [ ] `npm run db:migrate:deploy` run once from your machine (with `.env` pointing at Supabase)  
- [ ] `npm run db:seed` (optional)  
- [ ] Vercel env vars set  
- [ ] Redeploy on Vercel  

## Personalization (cross-device)

Logged-in customers sync shopping preferences to `User.personalization` (JSON) in Postgres.

- API: `GET/POST/DELETE /api/personalization/sync` (requires sign-in)
- Migration: `20260523210000_user_personalization`
- Local browser cache still used for guests; sign-in merges local + server

## Admin login after seed

The seed script creates an admin user (see `prisma/seed.ts` for email/password).

## Cannot be automated from this repo

Creating a Supabase project requires your Supabase account. This repository only contains the Prisma schema, migration SQL, and env templates—you paste the connection strings from your dashboard.
