import type { Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  canManageRoles,
  isStaffRole,
  isStaffUser,
  isSuperAdminUser,
} from "@/lib/admin-access";

export {
  canManageRoles,
  isStaffRole,
  isStaffUser,
  isSuperAdminUser,
  hasAdminEmail,
  ROLE_LABELS,
} from "@/lib/admin-access";

type StaffUser = Session["user"];

function authSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/** Resolve staff session from Auth.js or, on API routes, directly from the session cookie. */
async function resolveStaffUser(req?: NextRequest): Promise<StaffUser | null> {
  const session = await auth();
  if (session?.user) return session.user;

  const secret = authSecret();
  if (!secret) return null;

  const headerStore = req?.headers ?? (await headers());
  const token = await getToken({
    req: { headers: headerStore } as NextRequest,
    secret,
  });
  if (!token) return null;

  const id = (token.id ?? token.sub) as string | undefined;
  const email = token.email as string | null | undefined;
  if (!id && !email) return null;

  return {
    id: id ?? "",
    email,
    name: token.name as string | null | undefined,
    image: (token.picture as string | null | undefined) ?? undefined,
    role: token.role as string | undefined,
  };
}

/** Server component guard — redirects non-staff to admin sign-in. */
export async function requireAdmin() {
  const user = await resolveStaffUser();
  if (!user?.id && !user?.email) {
    redirect("/admin/login?redirect=/admin");
  }
  if (!isStaffUser(user)) {
    redirect("/admin/login?error=unauthorized");
  }
  return user;
}

/** API route guard — returns a 401/403 response or the user. */
export async function requireAdminApi(req?: NextRequest) {
  const user = await resolveStaffUser(req);
  if (!user?.id && !user?.email) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Session expired — please sign in again at /admin/login" },
        { status: 401 }
      ),
    };
  }
  if (!isStaffUser(user)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

/** Super-admin guard for pages — team roles, sensitive settings. */
export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (!canManageRoles(user)) {
    redirect("/admin?error=super-admin-required");
  }
  return user;
}

/** Super-admin guard for API routes. */
export async function requireSuperAdminApi(req?: NextRequest) {
  const result = await requireAdminApi(req);
  if (result.error) return result;
  if (!canManageRoles(result.user)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Only super admins can manage team roles." },
        { status: 403 }
      ),
    };
  }
  return result;
}
