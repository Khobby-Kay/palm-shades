import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/admin";
import { ROLE_LABELS } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdminApi(req);
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const take = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 100);

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      roleLabel: ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
