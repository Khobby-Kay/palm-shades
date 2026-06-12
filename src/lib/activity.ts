import { prisma, prismaQueryRaw } from "@/lib/prisma";

const VERSION_CACHE_MS = 15000;
let cachedVersion: { value: number; at: number } | null = null;

/** Monotonic fingerprint of latest site activity — used for live sync. */
export async function getActivityVersion(): Promise<number> {
  const now = Date.now();
  if (cachedVersion && now - cachedVersion.at < VERSION_CACHE_MS) {
    return cachedVersion.value;
  }

  try {
    const rows = await prismaQueryRaw<Array<{ version: number | null }>>`
      SELECT GREATEST(
        COALESCE((SELECT EXTRACT(EPOCH FROM "updatedAt") * 1000 FROM "Order" ORDER BY "updatedAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "updatedAt") * 1000 FROM "Booking" ORDER BY "updatedAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "updatedAt") * 1000 FROM "Product" ORDER BY "updatedAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "updatedAt") * 1000 FROM "Service" ORDER BY "updatedAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "createdAt") * 1000 FROM "ContactMessage" ORDER BY "createdAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "createdAt") * 1000 FROM "Review" ORDER BY "createdAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "createdAt") * 1000 FROM "GalleryItem" ORDER BY "createdAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "createdAt") * 1000 FROM "SiteBanner" ORDER BY "createdAt" DESC LIMIT 1), 0),
        COALESCE((SELECT EXTRACT(EPOCH FROM "createdAt") * 1000 FROM "Category" ORDER BY "createdAt" DESC LIMIT 1), 0)
      ) AS version
    `;

    const version = rows[0]?.version ?? 0;
    const value = Number.isFinite(version) ? Math.trunc(version) : 0;
    cachedVersion = { value, at: Date.now() };
    return value;
  } catch {
    return cachedVersion?.value ?? 0;
  }
}
