import { siteConfig } from "@/lib/site";
import { sendTiwaSms } from "@/lib/sms-tiwa/client";

/** Phone number for owner/admin SMS alerts (booking & order notifications). */
export function getAdminNotifyPhone(): string | null {
  return (
    process.env.ADMIN_PHONE?.trim() ||
    process.env.ADMIN_SMS_PHONE?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() ||
    siteConfig.contact.phones[0]?.tel ||
    null
  );
}

export async function sendAdminSms(message: string): Promise<void> {
  const phone = getAdminNotifyPhone();
  if (!phone) {
    console.warn("[admin-alert] No ADMIN_PHONE configured — skipping admin SMS");
    return;
  }
  const prefix = `${siteConfig.shortName}: `;
  await sendTiwaSms({ to: phone, message: `${prefix}${message}` });
}
