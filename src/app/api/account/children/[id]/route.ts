import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const childSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  age: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(20).nullable()
  ),
  hairType: z.string().trim().optional().nullable(),
  allergies: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

async function ownedChild(id: string, userId: string) {
  return prisma.childProfile.findFirst({
    where: { id, userId },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownedChild(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = childSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const child = await prisma.childProfile.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      age: parsed.data.age,
      hairType: parsed.data.hairType ?? null,
      allergies: parsed.data.allergies ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ child });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await ownedChild(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.childProfile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
