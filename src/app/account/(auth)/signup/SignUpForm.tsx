"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function SignUpForm({
  callbackUrl,
  googleConfigured,
}: {
  callbackUrl: string;
  googleConfigured: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || null,
      password: String(fd.get("password") ?? ""),
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) {
            setErrors(data.fieldErrors);
            setFormError("Please correct the highlighted fields.");
          } else {
            setFormError(data?.error ?? "Couldn't create your account.");
          }
          return;
        }
        // Auto sign-in.
        const signed = await signIn("credentials", {
          email: payload.email,
          password: payload.password,
          redirect: false,
        });
        if (signed?.error) {
          setFormError("Account created — please sign in to continue.");
          return;
        }
        window.location.assign(callbackUrl);
      } catch (err) {
        console.error(err);
        setFormError("Couldn't create your account. Please try again.");
      }
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
          label="Full name"
          name="name"
          placeholder="Akosua Mensah"
          required
          autoComplete="name"
          error={errors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          placeholder="024 214 9489"
          required
          autoComplete="tel"
          error={errors.phone}
          hint="For order & account SMS updates"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters with a letter and number"
          required
          minLength={8}
          autoComplete="new-password"
          error={errors.password}
        />

        {formError ? (
          <div className="flex items-start gap-2 rounded-2xl border border-primary-200 bg-primary-50/60 p-3 text-sm text-primary-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}

        <Button type="submit" size="lg" variant="primary" disabled={isPending} className="w-full">
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
