import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Palm Shades account.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? "/account");

  const googleConfigured =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
        Welcome to Palm Shades
      </p>
      <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-charcoal-light">
        Already have one?{" "}
        <Link
          href={`/account/signin${
            searchParams.callbackUrl
              ? `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}`
              : ""
          }`}
          className="font-medium text-primary-700 hover:text-primary-800"
        >
          Sign in
        </Link>
        .
      </p>

      <div className="mt-8">
        <SignUpForm
          callbackUrl={searchParams.callbackUrl ?? "/account"}
          googleConfigured={googleConfigured}
        />
      </div>
    </div>
  );
}
