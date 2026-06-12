import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  buildUploadFilename,
  uploadAdminImage,
} from "@/lib/storage/image-upload";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "admin-upload", 20, 60_000);
  if (limited) return limited;

  const { error } = await requireAdminApi(req);
  if (error) return error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP or GIF images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 5MB." }, { status: 400 });
  }

  const filename = buildUploadFilename(file.name, file.type);

  try {
    const uploaded = await uploadAdminImage(file, filename);
    return NextResponse.json({ url: uploaded.url, storage: uploaded.storage });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not upload image. Try again.";
    console.error("[admin/upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
