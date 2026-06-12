import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  shortDesc: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  durationMin: z.number().int().positive(),
  priceGhs: z.number().positive(),
  ageRange: z.string().optional().nullable(),
  preparation: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const d = parsed.data;
  const service = await prisma.service.create({
    data: {
      name: d.name,
      slug: d.slug?.trim() || slugify(d.name),
      shortDesc: d.shortDesc,
      description: d.description,
      durationMin: d.durationMin,
      price: Math.round(d.priceGhs * 100),
      ageRange: d.ageRange,
      preparation: d.preparation,
      isFeatured: d.isFeatured ?? false,
      isActive: d.isActive ?? true,
    },
  });

  return NextResponse.json({ service });
}
