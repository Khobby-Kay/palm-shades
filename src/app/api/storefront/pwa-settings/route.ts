import { NextResponse } from "next/server";
import { getPwaSettings } from "@/lib/cms/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPwaSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
