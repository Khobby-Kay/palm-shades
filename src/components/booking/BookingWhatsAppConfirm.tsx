"use client";

import { MessageCircle } from "lucide-react";
import { bookingWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site";

type Props = {
  serviceName: string;
  dateLabel: string;
  startTime: string;
  guestName: string;
  guestPhone: string;
};

export function BookingWhatsAppConfirm({
  serviceName,
  dateLabel,
  startTime,
  guestName,
  guestPhone,
}: Props) {
  const ready =
    serviceName &&
    dateLabel &&
    startTime &&
    guestName.trim().length >= 2 &&
    guestPhone.trim().length >= 8;

  const href = ready
    ? whatsappUrl(
        bookingWhatsAppMessage(
          serviceName,
          dateLabel,
          startTime,
          guestName.trim(),
          guestPhone.trim()
        )
      )
    : siteConfig.socials.whatsapp;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-600 px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
      aria-disabled={!ready}
      onClick={(e) => {
        if (!ready) e.preventDefault();
      }}
    >
      <MessageCircle className="h-4 w-4" />
      {ready ? "Confirm on WhatsApp instead" : "Fill details to WhatsApp confirm"}
    </a>
  );
}
