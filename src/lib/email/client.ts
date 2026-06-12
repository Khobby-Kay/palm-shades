import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Palm Shades <hello@palmshades.com>";
export const EMAIL_ADMIN =
  process.env.EMAIL_ADMIN_NOTIFICATIONS ?? "hello@palmshades.com";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// ---------------------------------------------------------------
// SMTP (Gmail / any SMTP) — preferred when configured.
// Works with a Gmail App Password and needs no custom domain.
// ---------------------------------------------------------------

let smtpTransport: Transporter | null | undefined;

function getSmtp(): Transporter | null {
  if (smtpTransport !== undefined) return smtpTransport;

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    smtpTransport = null;
    return smtpTransport;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  smtpTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user, pass },
  });
  return smtpTransport;
}

// ---------------------------------------------------------------
// Resend — used when RESEND_API_KEY is set and SMTP is not.
// Note: Resend requires a verified sending domain.
// ---------------------------------------------------------------

let resendClient: Resend | null | undefined;

function getResend(): Resend | null {
  if (resendClient !== undefined) return resendClient;
  const key = process.env.RESEND_API_KEY;
  resendClient = key && key.trim() ? new Resend(key) : null;
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return getSmtp() !== null || getResend() !== null;
}

/**
 * Sends an email via SMTP (Gmail), then Resend, otherwise logs a dry-run.
 * Never throws — email failures must not break checkout / booking flows.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const smtp = getSmtp();
  if (smtp) {
    try {
      const info = await smtp.sendMail({
        from: EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      });
      return { ok: true, id: info.messageId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown SMTP error";
      console.error("[email] SMTP send failed:", msg);
      return { ok: false, error: msg };
    }
  }

  const resend = getResend();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, id: data?.id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown email error";
      console.error("[email] Resend send failed:", msg);
      return { ok: false, error: msg };
    }
  }

  console.log("\n[email] (dry-run — no SMTP_* or RESEND_API_KEY set)");
  console.log(`  to: ${Array.isArray(input.to) ? input.to.join(", ") : input.to}`);
  console.log(`  subject: ${input.subject}`);
  if (input.text) console.log(`  text: ${input.text.slice(0, 200)}…`);
  return { ok: true, id: "dry-run" };
}
