import { formatSmsPhone } from "@/lib/sms/phone";
import { siteConfig } from "@/lib/site";

export type SendSmsInput = {
  to: string;
  message: string;
};

export function isSmsConfigured(): boolean {
  const provider = (process.env.SMS_PROVIDER ?? "hubtel").toLowerCase();
  if (provider === "dry-run" || provider === "off") return false;
  if (provider === "arkesel") {
    return !!process.env.ARKESEL_API_KEY?.trim();
  }
  return (
    !!process.env.HUBTEL_CLIENT_ID?.trim() &&
    !!process.env.HUBTEL_CLIENT_SECRET?.trim()
  );
}

/**
 * Send SMS via Hubtel (default, Ghana) or Arkesel.
 * Never throws — failures are logged only.
 */
export async function sendSms(
  input: SendSmsInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const to = formatSmsPhone(input.to);
  if (!to) {
    return { ok: false, error: "Invalid phone number" };
  }

  const message = input.message.trim().slice(0, 480);
  if (!message) return { ok: false, error: "Empty message" };

  const provider = (process.env.SMS_PROVIDER ?? "hubtel").toLowerCase();

  if (provider === "dry-run" || provider === "off") {
    console.log("\n[sms] (dry-run — SMS_PROVIDER not configured)");
    console.log(`  to: ${to}`);
    console.log(`  message: ${message}`);
    return { ok: true, id: "dry-run" };
  }

  if (provider === "arkesel") {
    return sendViaArkesel(to, message);
  }

  return sendViaHubtel(to, message);
}

async function sendViaHubtel(
  to: string,
  message: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const clientId = process.env.HUBTEL_CLIENT_ID?.trim();
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET?.trim();
  const from = process.env.HUBTEL_SENDER_ID?.trim() || siteConfig.shortName;

  if (!clientId || !clientSecret) {
    console.log("\n[sms] (dry-run — HUBTEL_CLIENT_ID / HUBTEL_CLIENT_SECRET missing)");
    console.log(`  to: ${to}`);
    console.log(`  message: ${message}`);
    return { ok: true, id: "dry-run" };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const digits = to.replace(/\D/g, "");

  try {
    const res = await fetch("https://smsc.hubtel.com/v1/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: from,
        To: digits,
        Content: message,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      MessageId?: string;
      messageId?: string;
      status?: string;
      Status?: string;
      message?: string;
    };

    if (!res.ok) {
      const err = data.message ?? data.status ?? `HTTP ${res.status}`;
      console.error("[sms] Hubtel failed:", err);
      return { ok: false, error: String(err) };
    }

    return {
      ok: true,
      id: data.MessageId ?? data.messageId ?? data.status ?? data.Status,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Hubtel SMS error";
    console.error("[sms] Hubtel error:", msg);
    return { ok: false, error: msg };
  }
}

async function sendViaArkesel(
  to: string,
  message: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.ARKESEL_API_KEY?.trim();
  const sender = process.env.ARKESEL_SENDER_ID?.trim() || siteConfig.shortName;

  if (!apiKey) {
    console.log("\n[sms] (dry-run — ARKESEL_API_KEY missing)");
    return { ok: true, id: "dry-run" };
  }

  const digits = to.replace(/\D/g, "");

  try {
    const res = await fetch("https://sms.arkesel.com/sms/api?action=send-sms", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        message,
        recipients: [digits],
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
    };

    if (!res.ok || data.status === "error") {
      console.error("[sms] Arkesel failed:", data.message ?? res.status);
      return { ok: false, error: data.message ?? `HTTP ${res.status}` };
    }

    return { ok: true, id: "arkesel" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Arkesel SMS error";
    console.error("[sms] Arkesel error:", msg);
    return { ok: false, error: msg };
  }
}
