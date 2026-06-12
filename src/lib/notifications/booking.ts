import { sendEmail, EMAIL_ADMIN } from "@/lib/email/client";
import { bookingConfirmationEmail } from "@/lib/email/templates";
import { sendTiwaSms } from "@/lib/sms-tiwa/client";
import {
  tiwaSmsBookingConfirmed,
  tiwaSmsAdminNewBooking,
} from "@/lib/sms-tiwa/messages";
import { bookingLocationLabel } from "@/lib/booking/price";
import { sendAdminSms } from "@/lib/notifications/admin-alert";
import type { BookingLocation } from "@/lib/types/enums";

export type BookingNotificationInput = {
  bookingId: string;
  serviceName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: Date;
  startTime: string;
  durationMin: number;
  location: BookingLocation | string;
  address?: string | null;
  childName?: string | null;
  notes?: string | null;
  totalMinor: number;
  currency: string;
};

/** Fire-and-forget booking confirmation via email + Moolre SMS (Tiwa settings). */
export async function notifyBookingConfirmed(
  input: BookingNotificationInput
): Promise<void> {
  const tmpl = bookingConfirmationEmail({
    bookingId: input.bookingId,
    serviceName: input.serviceName,
    guestName: input.guestName,
    date: input.date,
    startTime: input.startTime,
    durationMin: input.durationMin,
    location: input.location,
    address: input.address,
    childName: input.childName,
    notes: input.notes,
    total: input.totalMinor,
    currency: input.currency,
  });

  await Promise.allSettled([
    sendEmail({ to: input.guestEmail, ...tmpl }),
    sendEmail({
      to: EMAIL_ADMIN,
      subject: `[Palm Shades] New appointment · ${input.serviceName}`,
      html: tmpl.html,
      text: tmpl.text,
    }),
    input.guestPhone
      ? sendTiwaSms({
          to: input.guestPhone,
          message: tiwaSmsBookingConfirmed({
            name: input.guestName.split(/\s+/)[0] || input.guestName,
            serviceName: input.serviceName,
            date: input.date,
            startTime: input.startTime,
            locationLabel: bookingLocationLabel(input.location),
            totalMajor: input.totalMinor / 100,
            currency: input.currency,
          }),
        })
      : Promise.resolve(null),
    sendAdminSms(
      tiwaSmsAdminNewBooking({
        guestName: input.guestName,
        serviceName: input.serviceName,
        date: input.date,
        startTime: input.startTime,
        locationLabel: bookingLocationLabel(input.location),
        totalMajor: input.totalMinor / 100,
      })
    ),
  ]);
}
