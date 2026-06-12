# Palm Shades

Luxury eyewear boutique — cloned from the Palm Shades commerce platform and rebranded for **Palm Shades** (demo / contract pitch).

## Quick start

```bash
cd palm-shades
npm install
cp .env.example .env.local   # add your Supabase / Stripe keys
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Brand

- **Name:** Palm Shades  
- **Tagline:** See Luxury Clearly  
- **Palette:** Champagne gold (`#C5A572`), palm green (`#1E3D34`), ivory  
- **Categories:** Sunglasses, Optical Frames, Luxury Collection, Blue Light, Accessories  

## Separate from Palm Shades

This is a **standalone copy** at `Desktop/palm-shades`. It does not share git history or database with Palm Shades unless you point `.env` to the same Supabase project (not recommended for production).

## Before client demo

1. Replace placeholder phone numbers and `hello@palmshades.com` in `src/lib/site.ts`
2. Add real logo PNG to `public/images/palm-shades-logo.png` and set `logoType: "image"` in `src/lib/brand-assets.ts`
3. Connect a **new** Supabase project + run `scripts/create-assistant-chat-log.sql` if using the chat assistant
4. Swap Unsplash hero URLs in `src/lib/media.ts` for client photography when ready

## Deploy

Deploy to Vercel as a **new project** with its own env vars and `NEXT_PUBLIC_SITE_URL`.
