import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaffRole } from "@/lib/admin";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Palm Shades account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  const callbackUrl = searchParams.callbackUrl ?? "/account";

  if (session?.user) {
    const role = (session.user as { role?: string } | undefined)?.role;
    const callbackPathname = safePathname(callbackUrl);
    const wantsAdmin = callbackPathname.startsWith("/admin");

    // Prevent redirect loops when a signed-in non-staff user tries to open /admin.
    // We send them to account instead of bouncing back to /admin -> signin -> /admin ...
    if (wantsAdmin && !isStaffRole(role)) {
      redirect("/account?error=admin-required");
    }

    redirect(callbackUrl);
  }

  const googleConfigured =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-charcoal-light">
        Don&rsquo;t have an account yet?{" "}
        <Link
          href={`/account/signup${
            searchParams.callbackUrl
              ? `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}`
              : ""
          }`}
          className="font-medium text-primary-700 hover:text-primary-800"
        >
          Create one
        </Link>
        .
      </p>

      <div className="mt-8">
        <SignInForm
          callbackUrl={callbackUrl}
          googleConfigured={googleConfigured}
          initialError={searchParams.error}
        />
      </div>
    </div>
  );
}

function safePathname(url: string): string {
  try {
    return new URL(url, "http://localhost:3000").pathname;
  } catch {
    return "/account";
  }
}
