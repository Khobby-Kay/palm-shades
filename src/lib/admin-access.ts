/** Shared admin access rules — used by middleware, API routes, and pages. */

import type { UserRole } from "@/lib/types/enums";
import { USER_ROLES } from "@/lib/types/enums";

const DEFAULT_ADMIN_EMAILS = ["admin@palmshades.com"];

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  STAFF: "Staff",
  ADMIN: "Super admin",
};

/** Roles a super admin may assign through the team panel. */
export const ASSIGNABLE_ROLES = USER_ROLES;

export function getAdminEmailAllowlist(): Set<string> {
  const extra = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ADMIN_EMAILS, ...extra].map((e) => e.toLowerCase()));
}

export function hasAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().has(email.toLowerCase());
}

export function isStaffRole(role?: string | null): boolean {
  return role === "ADMIN" || role === "STAFF";
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}

export function isStaffUser(user?: {
  role?: string | null;
  email?: string | null;
} | null): boolean {
  if (!user) return false;
  return isStaffRole(user.role) || hasAdminEmail(user.email);
}

/** Full admin control — manage team roles, payments, etc. */
export function isSuperAdminUser(user?: {
  role?: string | null;
  email?: string | null;
} | null): boolean {
  if (!user) return false;
  return isSuperAdminRole(user.role) || hasAdminEmail(user.email);
}

export function canManageRoles(user?: {
  role?: string | null;
  email?: string | null;
} | null): boolean {
  return isSuperAdminUser(user);
}
