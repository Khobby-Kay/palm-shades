import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import Google from "next-auth/providers/google";
import { hasAdminEmail, isStaffRole } from "@/lib/admin-access";

/**
 * Edge-safe config — DO NOT import Prisma or bcrypt here.
 * Loaded by both the full Auth.js handler and the middleware.
 */
const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const authConfig = {
  pages: {
    signIn: "/account/signin",
  },
  trustHost: true,
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const email = (auth?.user as { email?: string | null } | undefined)?.email;
      const isStaff = isStaffRole(role) || hasAdminEmail(email);

      // Legacy Palm Shades Prisma admin APIs (Tiwa dashboard uses Supabase Auth at /admin/login).
      if (path.startsWith("/api/admin")) {
        if (!auth?.user) {
          return NextResponse.json(
            { error: "Session expired — sign in at /admin/login (Supabase) or /account/signin" },
            { status: 401 }
          );
        }
        if (!isStaff) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return true;
      }

      const isLoggedIn = !!auth?.user;
      const isProtected =
        path.startsWith("/account") &&
        !path.startsWith("/account/signin") &&
        !path.startsWith("/account/signup");
      if (isProtected) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
