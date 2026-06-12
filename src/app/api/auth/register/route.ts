import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { notifyAccountCreated } from "@/lib/notifications/customer";
import { normalizeGhPhone } from "@/lib/sms/phone";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid Ghana phone number")
    .refine((v) => normalizeGhPhone(v) !== null, "Use a valid Ghana mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
});

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "register", 5, 60_000);
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
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const phone = normalizeGhPhone(data.phone)!;

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
    },
    select: { id: true, email: true, name: true, phone: true },
  });

  notifyAccountCreated({
    name: user.name ?? data.name,
    email: user.email!,
    phone: user.phone ?? phone,
  });

  return NextResponse.json({ ok: true, user });
}
