import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDbPoolError } from "@/lib/prisma-errors";
import { mergeVisitorProfiles } from "@/lib/personalization/merge";
import { parseStoredProfile } from "@/lib/personalization/parse-profile";
import { EMPTY_PROFILE } from "@/lib/personalization/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { personalization: true, updatedAt: true },
    });

    const profile = parseStoredProfile(user?.personalization) ?? EMPTY_PROFILE;
    return NextResponse.json({
      profile,
      updatedAt: user?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (!isDbPoolError(error)) {
      console.error("[personalization/sync GET]", error);
    }
    // Graceful fallback: keep UX responsive even if DB pool is saturated.
    return NextResponse.json({
      profile: EMPTY_PROFILE,
      updatedAt: null,
      degraded: true,
    });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { profile?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const local = parseStoredProfile(body.profile);
  if (!local) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { personalization: true },
    });

    const remote = parseStoredProfile(user?.personalization) ?? EMPTY_PROFILE;
    const merged = mergeVisitorProfiles(local, remote);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { personalization: merged as object },
      select: { updatedAt: true },
    });

    return NextResponse.json({
      profile: merged,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    if (!isDbPoolError(error)) {
      console.error("[personalization/sync POST]", error);
    }
    // Non-fatal fallback: return local profile so client continues smoothly.
    return NextResponse.json({
      profile: local,
      updatedAt: null,
      degraded: true,
    });
  }
}

/** Clear server-stored preferences (privacy). */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { personalization: EMPTY_PROFILE as object },
    });
  } catch (error) {
    if (!isDbPoolError(error)) {
      console.error("[personalization/sync DELETE]", error);
    }
  }

  return NextResponse.json({ profile: EMPTY_PROFILE });
}
