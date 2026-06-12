import { NextRequest, NextResponse } from "next/server";
import { syncCatalogFromSupabase } from "@/lib/sync/catalog-from-supabase";

export const dynamic = "force-dynamic";

/** GET/POST — cron-friendly catalog sync (set CRON_SECRET). */
export async function GET(req: NextRequest) {
  return runSync(req);
}

export async function POST(req: NextRequest) {
  return runSync(req);
}

async function runSync(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth =
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      req.nextUrl.searchParams.get("secret");
    if (auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await syncCatalogFromSupabase();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
