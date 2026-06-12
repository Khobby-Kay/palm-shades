"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function SignInForm({
  callbackUrl,
  googleConfigured,
  initialError,
}: {
  callbackUrl: string;
  googleConfigured: boolean;
  initialError?: string;
}) {
  const [error, setError] = useState<string | null>(initialError ? friendlyError(initialError) : null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email or password is incorrect.");
        return;
      }
      window.location.assign(callbackUrl);
    });
  };

  const onGoogle = () => {
    startGoogleTransition(async () => {
      await signIn("google", { callbackUrl });
    });
  };

  return (
    <div className="space-y-5">
      {googleConfigured ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onGoogle}
            disabled={isGooglePending}
            className="w-full"
          >
            <GoogleIcon />
            {isGooglePending ? "Redirecting…" : "Continue with Google"}
          </Button>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-charcoal-light">
            <span className="h-px flex-1 bg-blush-200" />
            or with email
            <span className="h-px flex-1 bg-blush-200" />
          </div>
        </>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-primary-200 bg-primary-50/60 p-3 text-sm text-primary-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <Button type="submit" size="lg" variant="primary" disabled={isPending} className="w-full">
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "CredentialsSignin":
      return "Email or password is incorrect.";
    case "OAuthAccountNotLinked":
      return "An account with this email already exists. Try a different sign-in method.";
    default:
      return "Couldn't sign you in. Please try again.";
  }
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.75 3.28-8.07z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
