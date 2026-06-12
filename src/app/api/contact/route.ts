import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, EMAIL_ADMIN } from "@/lib/email/client";
import { escapeHtml } from "@/lib/security/html-escape";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().nullable(),
  subject: z.string().trim().optional().nullable(),
  message: z.string().trim().min(10, "Please include a bit more detail"),
});

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "contact", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.contactMessage.create({ data });

  void sendEmail({
    to: EMAIL_ADMIN,
    subject: `[Palm Shades] Contact · ${data.subject ?? data.name}`,
    html: `<p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)})</p><p>${escapeHtml(data.message)}</p>`,
    text: `${data.name} <${data.email}>\n\n${data.message}`,
    replyTo: data.email,
  });

  return NextResponse.json({ ok: true });
}
