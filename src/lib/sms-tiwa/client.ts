import { formatTiwaSmsPhone, maskPhone } from "@/lib/sms-tiwa/phone";
import type { MoolreSmsResponse, SendTiwaSmsInput, SendTiwaSmsResult } from "@/lib/sms-tiwa/types";

const MOOLRE_SMS_URL = "https://api.moolre.com/open/sms/send";

export function isTiwaSmsConfigured(): boolean {
  return !!(
    process.env.MOOLRE_SMS_API_KEY?.trim() || process.env.MOOLRE_API_KEY?.trim()
  );
}

export function getTiwaSmsSenderId(): string {
  return process.env.MOOLRE_SMS_SENDER_ID?.trim() || "Palm Shades";
}

function getMoolreSmsVasKey(): string | null {
  return (
    process.env.MOOLRE_SMS_API_KEY?.trim() ||
    process.env.MOOLRE_API_KEY?.trim() ||
    null
  );
}

/**
 * Send SMS via Moolre VAS API.
 * Ported from tiwa lib/notifications.ts sendSMS() — standalone, not wired to orders yet.
 */
export async function sendTiwaSms(
  input: SendTiwaSmsInput
): Promise<SendTiwaSmsResult> {
  const smsVasKey = getMoolreSmsVasKey();
  if (!smsVasKey) {
    console.warn("[sms-tiwa] Missing MOOLRE_SMS_API_KEY or MOOLRE_API_KEY");
    return { ok: false, response: null, error: "SMS not configured" };
  }

  const recipient = formatTiwaSmsPhone(input.to);
  if (!recipient) {
    return { ok: false, response: null, error: "Invalid phone number" };
  }

  const message = input.message.trim();
  if (!message) {
    return { ok: false, response: null, error: "Empty message" };
  }

  try {
    console.log(`[sms-tiwa] Sending to ${maskPhone(recipient)}`);

    const response = await fetch(MOOLRE_SMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-VASKEY": smsVasKey,
      },
      body: JSON.stringify({
        type: 1,
        senderid: getTiwaSmsSenderId(),
        messages: [{ recipient, message }],
      }),
    });

    const contentType = response.headers.get("content-type") || "";
    let result: MoolreSmsResponse;

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[sms-tiwa] Non-JSON response:", text.slice(0, 200));
      return {
        ok: false,
        response: { status: 0, error: text.slice(0, 200) },
        formattedPhone: recipient,
        error: text.slice(0, 200) || `HTTP ${response.status}`,
      };
    }

    result = (await response.json()) as MoolreSmsResponse;
    const ok = result.status === 1;

    console.log(
      "[sms-tiwa] Result:",
      ok ? "Success" : "Failed",
      "| Code:",
      result.code
    );

    if (!ok) {
      console.log("[sms-tiwa] Full response:", JSON.stringify(result, null, 2));
    }

    return {
      ok,
      response: result,
      formattedPhone: recipient,
      error: ok ? undefined : result.message || result.error || "SMS failed",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Moolre SMS error";
    console.error("[sms-tiwa] Error:", msg);
    return { ok: false, response: null, formattedPhone: recipient, error: msg };
  }
}
