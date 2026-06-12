import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/tiwa/supabase-admin";
import { verifySuperAdmin } from "@/lib/tiwa/auth";
import {
  ASSIGNABLE_ADMIN_PERMISSIONS,
  normalizeAdminPermissions,
  type AdminPermissionKey,
} from "@/lib/admin/permissions";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().trim().min(1).max(120).optional(),
  permissions: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const auth = await verifySuperAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role, admin_permissions, created_at")
    .in("role", ["admin", "staff"])
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: (data ?? []).map((row) => ({
      ...row,
      admin_permissions: normalizeAdminPermissions(row.admin_permissions),
    })),
    permissionOptions: ASSIGNABLE_ADMIN_PERMISSIONS,
  });
}

export async function POST(request: Request) {
  const auth = await verifySuperAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password, fullName, permissions } = parsed.data;
  const normalizedPermissions = normalizeAdminPermissions(permissions);

  if (normalizedPermissions.length === 0) {
    return NextResponse.json(
      { error: "Select at least one permission for the new team member" },
      { status: 400 }
    );
  }

  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });

  if (createError || !created.user) {
    const message = createError?.message ?? "Failed to create user";
    if (message.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: created.user.id,
      email,
      full_name: fullName ?? null,
      role: "staff",
      admin_permissions: normalizedPermissions,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    member: {
      id: created.user.id,
      email,
      full_name: fullName ?? null,
      role: "staff" as const,
      admin_permissions: normalizedPermissions as AdminPermissionKey[],
    },
  });
}
