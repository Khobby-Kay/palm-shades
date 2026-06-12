import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { verifySuperAdmin } from "@/lib/tiwa/auth";
import {
  isSuperAdmin,
  normalizeAdminPermissions,
} from "@/lib/admin/permissions";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  permissions: z.array(z.string()).optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === auth.user?.id) {
    return NextResponse.json(
      { error: "Use account settings to update your own super admin profile" },
      { status: 400 }
    );
  }

  const { data: target, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, email")
    .eq("id", id)
    .single();

  if (targetError || !target) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  if (isSuperAdmin(target.role)) {
    return NextResponse.json(
      { error: "Cannot modify another super admin from the team page" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};

  if (parsed.data.fullName !== undefined) {
    updates.full_name = parsed.data.fullName;
  }

  if (parsed.data.permissions !== undefined) {
    const normalized = normalizeAdminPermissions(parsed.data.permissions);
    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "Staff members need at least one permission" },
        { status: 400 }
      );
    }
    updates.admin_permissions = normalized;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  if (parsed.data.password) {
    const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: parsed.data.password,
    });
    if (pwError) {
      return NextResponse.json({ error: pwError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySuperAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === auth.user?.id) {
    return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
  }

  const { data: target, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .single();

  if (targetError || !target) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  if (isSuperAdmin(target.role)) {
    return NextResponse.json(
      { error: "Cannot remove a super admin from the team page" },
      { status: 403 }
    );
  }

  const { error: demoteError } = await supabaseAdmin
    .from("profiles")
    .update({ role: "customer", admin_permissions: [] })
    .eq("id", id);

  if (demoteError) {
    return NextResponse.json({ error: demoteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
