import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

/** Stream private Vercel Blob files for product images (public catalogue assets). */
export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.searchParams.get("pathname");
  if (!pathname || pathname.includes("..") || !pathname.startsWith("products/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return new NextResponse("Blob storage not configured", { status: 503 });
  }

  try {
    const result = await get(pathname, { access: "private" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
