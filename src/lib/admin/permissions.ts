/**
 * Admin RBAC — `admin` role is super admin (full access).
 * `staff` role is scoped by `profiles.admin_permissions` (string[]).
 */

export type AdminPermissionKey =
  | "dashboard"
  | "orders"
  | "bookings"
  | "pos"
  | "products"
  | "categories"
  | "customers"
  | "reviews"
  | "inventory"
  | "analytics"
  | "coupons"
  | "cms"
  | "homepage"
  | "flash-sales"
  | "loyalty-program"
  | "pwa-settings"
  | "customer-insights"
  | "assistant-insights"
  | "notifications"
  | "test-sms"
  | "blog";

/** Only super admins — never assignable to staff. */
export const SUPER_ADMIN_ONLY_PERMISSIONS = ["team", "modules"] as const;

export type SuperAdminOnlyPermission =
  (typeof SUPER_ADMIN_ONLY_PERMISSIONS)[number];

export const ASSIGNABLE_ADMIN_PERMISSIONS: Array<{
  key: AdminPermissionKey;
  label: string;
  description: string;
  group: string;
}> = [
  { key: "dashboard", label: "Dashboard", description: "Overview home", group: "Core" },
  { key: "orders", label: "Orders", description: "View and manage orders", group: "Sales" },
  { key: "bookings", label: "Bookings", description: "Salon appointments", group: "Sales" },
  { key: "pos", label: "POS", description: "In-store point of sale", group: "Sales" },
  { key: "products", label: "Products", description: "Catalog and imports", group: "Catalog" },
  { key: "categories", label: "Categories", description: "Product categories", group: "Catalog" },
  { key: "inventory", label: "Inventory", description: "Stock levels", group: "Catalog" },
  { key: "customers", label: "Customers", description: "Customer records", group: "People" },
  { key: "reviews", label: "Reviews", description: "Product reviews", group: "People" },
  { key: "analytics", label: "Analytics", description: "Sales reports", group: "Insights" },
  { key: "customer-insights", label: "Customer insights", description: "CRM analytics", group: "Insights" },
  { key: "assistant-insights", label: "Assistant insights", description: "Shopping assistant chat logs", group: "Insights" },
  { key: "coupons", label: "Coupons", description: "Discount codes", group: "Marketing" },
  { key: "notifications", label: "Notifications", description: "Email/SMS campaigns", group: "Marketing" },
  { key: "cms", label: "CMS / Pages", description: "Site content", group: "Content" },
  { key: "homepage", label: "Homepage", description: "Homepage builder", group: "Content" },
  { key: "blog", label: "Blog", description: "Blog posts", group: "Content" },
  { key: "flash-sales", label: "Flash sales", description: "Promotions", group: "Marketing" },
  { key: "loyalty-program", label: "Loyalty", description: "Loyalty program", group: "Marketing" },
  { key: "pwa-settings", label: "PWA", description: "App install settings", group: "Settings" },
  { key: "test-sms", label: "SMS debugger", description: "Test SMS sending", group: "Settings" },
];

const ALL_ASSIGNABLE_KEYS = new Set(
  ASSIGNABLE_ADMIN_PERMISSIONS.map((p) => p.key)
);

const ROUTE_RULES: Array<{
  prefix: string;
  permission: AdminPermissionKey | SuperAdminOnlyPermission;
  exact?: boolean;
}> = [
  { prefix: "/admin/team", permission: "team" },
  { prefix: "/admin/modules", permission: "modules" },
  { prefix: "/admin/orders", permission: "orders" },
  { prefix: "/admin/bookings", permission: "bookings" },
  { prefix: "/admin/pos", permission: "pos" },
  { prefix: "/admin/products", permission: "products" },
  { prefix: "/admin/categories", permission: "categories" },
  { prefix: "/admin/customers", permission: "customers" },
  { prefix: "/admin/reviews", permission: "reviews" },
  { prefix: "/admin/inventory", permission: "inventory" },
  { prefix: "/admin/analytics", permission: "analytics" },
  { prefix: "/admin/coupons", permission: "coupons" },
  { prefix: "/admin/cms", permission: "cms" },
  { prefix: "/admin/homepage", permission: "homepage" },
  { prefix: "/admin/flash-sales", permission: "flash-sales" },
  { prefix: "/admin/loyalty-program", permission: "loyalty-program" },
  { prefix: "/admin/pwa-settings", permission: "pwa-settings" },
  { prefix: "/admin/customer-insights", permission: "customer-insights" },
  { prefix: "/admin/assistant-insights", permission: "assistant-insights" },
  { prefix: "/admin/notifications", permission: "notifications" },
  { prefix: "/admin/test-sms", permission: "test-sms" },
  { prefix: "/admin/blog", permission: "blog" },
  { prefix: "/admin", permission: "dashboard", exact: true },
];

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

export function normalizeAdminPermissions(
  raw: unknown
): AdminPermissionKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (k): k is AdminPermissionKey =>
      typeof k === "string" && ALL_ASSIGNABLE_KEYS.has(k as AdminPermissionKey)
  );
}

export function hasAdminPermission(
  role: string | null | undefined,
  permissions: AdminPermissionKey[] | null | undefined,
  required: string
): boolean {
  if (isSuperAdmin(role)) return true;
  if (role !== "staff") return false;
  if (
    SUPER_ADMIN_ONLY_PERMISSIONS.includes(
      required as SuperAdminOnlyPermission
    )
  ) {
    return false;
  }
  return (permissions ?? []).includes(required as AdminPermissionKey);
}

export function resolvePermissionForPath(pathname: string): string | null {
  if (pathname === "/admin/login") return null;

  const sorted = [...ROUTE_RULES].sort(
    (a, b) => b.prefix.length - a.prefix.length
  );

  for (const rule of sorted) {
    if (rule.exact) {
      if (pathname === rule.prefix) return rule.permission;
      continue;
    }
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.permission;
    }
  }

  return null;
}

export function firstAllowedAdminPath(
  role: string | null | undefined,
  permissions: AdminPermissionKey[] | null | undefined
): string {
  if (isSuperAdmin(role)) return "/admin";

  const allowed = permissions ?? [];
  if (allowed.includes("dashboard")) return "/admin";

  for (const item of ASSIGNABLE_ADMIN_PERMISSIONS) {
    if (allowed.includes(item.key)) {
      const rule = ROUTE_RULES.find((r) => r.permission === item.key);
      if (rule) return rule.prefix;
    }
  }

  return "/admin/login?error=no_access";
}

export function roleDisplayLabel(role: string | null | undefined): string {
  if (role === "admin") return "Super Admin";
  if (role === "staff") return "Staff";
  return role ?? "User";
}
