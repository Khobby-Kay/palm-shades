import { get, put } from "@vercel/blob";
import {
  blobAccessMode,
  blobProxyUrl,
  isPrivateBlobStoreError,
} from "@/lib/storage/blob-access";

const BUCKET = "product-images";

export type UploadedImage = {
  url: string;
  storage: "vercel-blob" | "supabase" | "local";
};

function extensionForType(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

export function buildUploadFilename(originalName: string, contentType: string): string {
  const ext = extensionForType(contentType);
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 60);
  return `${Date.now()}-${safeName || "upload"}.${ext}`;
}

function getSupabaseProjectRef(): string | null {
  const explicit = process.env.SUPABASE_URL?.trim();
  if (explicit) {
    const match = explicit.match(/https:\/\/([^.]+)\.supabase\.co/i);
    if (match?.[1]) return match[1];
  }

  const dbUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";
  const match = dbUrl.match(/postgres\.([a-z0-9]+)@/i);
  return match?.[1] ?? null;
}

async function ensureSupabaseBucket(baseUrl: string, serviceKey: string) {
  const res = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
  });

  if (res.ok) return;
  const body = await res.text();
  if (res.status === 409 || body.toLowerCase().includes("already exists")) return;
  throw new Error(`Could not prepare Supabase storage bucket (${res.status}).`);
}

async function uploadToSupabase(
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<string> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const ref = getSupabaseProjectRef();
  if (!serviceKey || !ref) {
    throw new Error("Supabase storage is not configured.");
  }

  const baseUrl = `https://${ref}.supabase.co`;
  const objectPath = `products/${filename}`;

  let res = await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok && (res.status === 404 || res.status === 400)) {
    await ensureSupabaseBucket(baseUrl, serviceKey);
    res = await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(buffer),
    });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail
        ? `Supabase upload failed: ${detail.slice(0, 180)}`
        : `Supabase upload failed (${res.status}).`
    );
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

async function uploadToVercelBlob(
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    throw new Error("Vercel Blob is not configured.");
  }

  const pathname = `products/${filename}`;
  const mode = blobAccessMode();

  if (mode === "public") {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  try {
    const blob = await put(pathname, buffer, {
      access: "private",
      contentType,
      addRandomSuffix: false,
    });
    return blobProxyUrl(blob.pathname);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isPrivateBlobStoreError(message)) {
      throw new Error(
        "This Blob store is public-only. Set BLOB_ACCESS=public in your environment."
      );
    }
    throw error;
  }
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/products/${filename}`;
}

/** Persist an admin image upload to cloud storage (Vercel/Supabase) or local disk in dev. */
export async function uploadAdminImage(
  file: File,
  filename: string
): Promise<UploadedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "image/jpeg";

  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    const url = await uploadToVercelBlob(buffer, contentType, filename);
    return { url, storage: "vercel-blob" };
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() && getSupabaseProjectRef()) {
    const url = await uploadToSupabase(buffer, contentType, filename);
    return { url, storage: "supabase" };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Image storage is not configured on Vercel. Add Vercel Blob storage to the project, or set SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const url = await uploadToLocal(buffer, filename);
  return { url, storage: "local" };
}
