"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || "") || null,
      subject: String(fd.get("subject") || "") || null,
      message: String(fd.get("message")),
    };

    start(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.fieldErrors) setErrors(data.fieldErrors);
          setFormError(data?.error ?? "Could not send your message.");
          return;
        }
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } catch {
        setFormError("Could not send your message. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-blush-50/70 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary-600" />
        <p className="font-display text-2xl text-charcoal">Message sent.</p>
        <p className="text-sm text-charcoal-light">
          We&rsquo;ll reply within one business day. Thank you for reaching out.
        </p>
        <Button type="button" variant="outline" size="md" onClick={() => setSuccess(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={errors.name} />
        <Field label="Email" name="email" type="email" required error={errors.email} />
        <Field label="Phone" name="phone" type="tel" containerClassName="sm:col-span-2" />
        <Field label="Subject" name="subject" containerClassName="sm:col-span-2" />
      </div>
      <TextArea label="Message" name="message" rows={5} required error={errors.message} />
      {formError ? (
        <div className="flex gap-2 rounded-2xl border border-primary-200 bg-primary-50/60 p-3 text-sm text-primary-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      ) : null}
      <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
