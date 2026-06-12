import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  shortDesc: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  durationMin: z.number().int().positive().optional(),
  priceGhs: z.number().positive().optional(),
  ageRange: z.string().optional().nullable(),
  preparation: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const d = parsed.data;
  const service = await prisma.service.update({
    where: { id: params.id },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.slug !== undefined ? { slug: d.slug || slugify(d.name ?? "") } : {}),
      ...(d.shortDesc !== undefined ? { shortDesc: d.shortDesc } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.durationMin !== undefined ? { durationMin: d.durationMin } : {}),
      ...(d.priceGhs !== undefined ? { price: Math.round(d.priceGhs * 100) } : {}),
      ...(d.ageRange !== undefined ? { ageRange: d.ageRange } : {}),
      ...(d.preparation !== undefined ? { preparation: d.preparation } : {}),
      ...(d.isFeatured !== undefined ? { isFeatured: d.isFeatured } : {}),
      ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
    },
  });

  return NextResponse.json({ service });
}
