/** Stable app URL that streams a private Vercel Blob by pathname. */
export function blobProxyUrl(pathname: string): string {
  return `/api/media/blob?pathname=${encodeURIComponent(pathname)}`;
}

export function blobAccessMode(): "public" | "private" {
  const mode = process.env.BLOB_ACCESS?.trim().toLowerCase();
  if (mode === "public" || mode === "private") return mode;
  // Product photos are public catalogue assets — default to public when unset.
  return "public";
}

export function isPrivateBlobStoreError(message: string): boolean {
  return (
    message.includes("private store") ||
    message.includes("private access") ||
    message.includes("Cannot use public access")
  );
}

/** Rewrite broken private blob URLs already saved in the database. */
export function resolveStoredImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return url ?? "";

  if (url.startsWith("/api/media/blob")) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".private.blob.vercel-storage.com")) {
      const pathname = parsed.pathname.replace(/^\//, "");
      if (pathname) return blobProxyUrl(pathname);
    }
  } catch {
    /* relative or invalid URL — return as-is */
  }

  return url;
}
