import type { BookingLocation } from "@/lib/types/enums";

/** Home service is always double the in-boutique price. */
export const HOME_SERVICE_PRICE_MULTIPLIER = 2;

export function calculateBookingPrice(
  basePriceMinor: number,
  location: BookingLocation | string
): number {
  return location === "HOME_SERVICE"
    ? basePriceMinor * HOME_SERVICE_PRICE_MULTIPLIER
    : basePriceMinor;
}

export function bookingLocationLabel(location: string): string {
  return location === "HOME_SERVICE"
    ? "Home service (2× boutique rate)"
    : "In-boutique at our Pantang–Abokobi studio";
}
