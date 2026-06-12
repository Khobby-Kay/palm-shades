import { NextResponse } from "next/server";
import { getActivityVersion } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const version = await getActivityVersion();
    return NextResponse.json({ version }, { headers: NO_CACHE });
  } catch {
    return NextResponse.json({ version: 0 }, { status: 200, headers: NO_CACHE });
  }
}
