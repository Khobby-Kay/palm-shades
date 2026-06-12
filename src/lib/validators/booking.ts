import { z } from "zod";
import { BOOKING_LOCATIONS } from "@/lib/types/enums";

export const bookingSchema = z
  .object({
    serviceSlug: z.string().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Pick a time slot"),
    location: z.enum(BOOKING_LOCATIONS),
    address: z.string().trim().optional().nullable(),

    childName: z.string().trim().optional().nullable(),
    childAge: z.preprocess((v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return null;
      return Math.round(n);
    }, z.number().int().min(0).max(120).nullable()),
    childHairType: z.string().trim().optional().nullable(),
    childNotes: z.string().trim().optional().nullable(),

    guestName: z.string().trim().min(2, "Please enter your name"),
    guestEmail: z.string().trim().email("Please enter a valid email"),
    guestPhone: z.string().trim().min(7, "Please enter a phone number"),
    notes: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) =>
      data.location !== "HOME_SERVICE" ||
      (typeof data.address === "string" && data.address.trim().length > 5),
    { message: "Home address required for home service", path: ["address"] }
  )
  .refine(
    (data) => {
      const d = new Date(`${data.date}T12:00:00`);
      return d.getDay() !== 0;
    },
    { message: "We're closed on Sundays — please pick another day", path: ["date"] }
  );

export type BookingInput = z.infer<typeof bookingSchema>;

// Time slots offered for any service. Real availability would query bookings.
export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
