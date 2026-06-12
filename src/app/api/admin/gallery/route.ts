import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  alt: z.string().optional().nullable(),
  span: z.string().optional(),
  variant: z.string().optional(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const item = await prisma.galleryItem.create({ data: parsed.data });
  return NextResponse.json({ item });
}
