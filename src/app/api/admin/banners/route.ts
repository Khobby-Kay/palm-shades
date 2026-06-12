import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  placement: z.enum(["announcement", "hero"]).optional(),
  isActive: z.boolean().optional(),
  position: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const banner = await prisma.siteBanner.create({ data: parsed.data });
  return NextResponse.json({ banner });
}
