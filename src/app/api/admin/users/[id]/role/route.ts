import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/admin";
import { ROLE_LABELS } from "@/lib/admin-access";
import { roleUpdateSchema } from "@/lib/admin/user-roles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user: actor, error } = await requireSuperAdminApi(req);
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Role must be CUSTOMER, STAFF, or ADMIN." },
      { status: 400 }
    );
  }

  const targetId = params.id;
  if (!targetId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const nextRole = parsed.data.role;

  if (actor.id === target.id && nextRole !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot remove your own super admin access." },
      { status: 400 }
    );
  }

  if (target.role === "ADMIN" && nextRole !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "At least one super admin must remain on the team." },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: nextRole },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({
    user: {
      ...updated,
      roleLabel: ROLE_LABELS[updated.role as keyof typeof ROLE_LABELS] ?? updated.role,
    },
  });
}
