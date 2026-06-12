import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyAccountCreated } from "@/lib/notifications/customer";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth, unstable_update: updateSession } =
  NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma as unknown as PrismaClient),
    events: {
      // Google / OAuth sign-up (credentials register sends its own welcome).
      async createUser({ user }) {
        if (!user.email) return;
        notifyAccountCreated({
          name: user.name ?? "there",
          email: user.email,
          phone: (user as { phone?: string | null }).phone ?? "",
        });
      },
    },
    callbacks: {
      ...authConfig.callbacks,
      async jwt({ token, user, trigger }) {
        if (user) {
          token.id = user.id;
          token.role = (user as { role?: string }).role ?? "CUSTOMER";
          token.email = user.email;
        }

        try {
          // Backfill id/role once at sign-in (OAuth sessions may omit id on first pass).
          if (user && !token.id && token.email && typeof token.email === "string") {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email.toLowerCase() },
              select: { id: true, role: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
            }
          }

          // Sync role from DB only on sign-in or explicit session update — not every request.
          const shouldSyncRole =
            !!token.id && (Boolean(user) || trigger === "update");

          if (shouldSyncRole && typeof token.id === "string") {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id },
              select: { role: true },
            });
            if (dbUser) token.role = dbUser.role;
          }
        } catch (error) {
          console.error("[auth jwt] role sync skipped:", error);
        }

        return token;
      },
    },
    providers: [
      ...authConfig.providers,
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(rawCreds) {
          const parsed = credentialsSchema.safeParse(rawCreds);
          if (!parsed.success) return null;
          const { email, password } = parsed.data;

          try {
            const user = await prisma.user.findUnique({
              where: { email: email.toLowerCase() },
            });
            if (!user || !user.passwordHash) return null;

            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) return null;

            return {
              id: user.id,
              email: user.email!,
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              role: user.role,
            };
          } catch (error) {
            console.error("[auth credentials]", error);
            return null;
          }
        },
      }),
    ],
  });
