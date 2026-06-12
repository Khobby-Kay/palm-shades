import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Returns the signed-in user or redirects to sign-in. */
export async function requireUser(callbackUrl?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const dest = callbackUrl
      ? `/account/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/account/signin";
    redirect(dest);
  }
  return session.user;
}
