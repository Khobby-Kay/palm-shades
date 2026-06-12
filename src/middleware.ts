import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import {
  firstAllowedAdminPath,
  hasAdminPermission,
  normalizeAdminPermissions,
  resolvePermissionForPath,
} from "@/lib/admin/permissions";

// NextAuth(...).auth is overloaded; treat it as standard edge middleware here.
const nextAuth = NextAuth(authConfig).auth as unknown as NextMiddleware;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function applyApiSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function guardTiwaAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  if (pathname === "/admin/login") {
    return response;
  }

  let token: string | undefined = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    const projectRef = supabaseUrl?.split("//")[1]?.split(".")[0];
    if (projectRef) {
      token = request.cookies.get(`sb-${projectRef}-auth-token`)?.value;
    }
  }

  if (!token) {
    for (const [name, cookie] of request.cookies) {
      if (name.startsWith("sb-") && (name.endsWith("-auth-token") || name.includes("auth"))) {
        try {
          const parsed = JSON.parse(cookie.value);
          if (Array.isArray(parsed) && parsed[0]) {
            token = parsed[0];
          } else if (typeof parsed === "object" && parsed.access_token) {
            token = parsed.access_token;
          } else if (typeof parsed === "string") {
            token = parsed;
          }
        } catch {
          token = cookie.value;
        }
        if (token) break;
      }
    }
  }

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("error", "session_expired");
        return NextResponse.redirect(loginUrl);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, admin_permissions")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }

      const permissions = normalizeAdminPermissions(profile.admin_permissions);
      const required = resolvePermissionForPath(pathname);

      if (
        required &&
        !hasAdminPermission(profile.role, permissions, required)
      ) {
        const fallback = firstAllowedAdminPath(profile.role, permissions);
        if (fallback.startsWith("/admin/login")) {
          const loginUrl = new URL("/admin/login", request.url);
          loginUrl.searchParams.set("error", "no_access");
          return NextResponse.redirect(loginUrl);
        }
        const redirectUrl = new URL(fallback, request.url);
        redirectUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(redirectUrl);
      }

      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", profile.role);
    } catch (err) {
      console.error("[middleware] Supabase admin auth check failed:", err);
    }
  }

  return response;
}

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return guardTiwaAdmin(request);
  }

  if (pathname.startsWith("/api/")) {
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/api/admin")) {
    return nextAuth(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/api/:path*"],
};
