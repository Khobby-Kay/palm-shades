import { unstable_cache } from "next/cache";
import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";

const readAnnouncement = unstable_cache(
  async () => {
    if (!hasDatabase()) return null;
    return prisma.siteBanner
      .findFirst({
        where: { isActive: true, placement: "announcement" },
        orderBy: { position: "asc" },
      })
      .catch(() => null);
  },
  ["site-active-announcement"],
  { revalidate: 120, tags: ["announcement"] }
);

export async function getActiveAnnouncement() {
  return readAnnouncement();
}
