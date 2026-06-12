/**
 * Type-safe constants & union types for fields stored as plain strings
 * in the database. SQLite (our local DB) does not support native enums,
 * so we keep the values type-checked here at the app boundary instead.
 *
 * Keep these in sync with the inline comments in `prisma/schema.prisma`.
 */

export const USER_ROLES = ["CUSTOMER", "ADMIN", "STAFF"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BOOKING_LOCATIONS = ["IN_SALON", "HOME_SERVICE"] as const;
export type BookingLocation = (typeof BOOKING_LOCATIONS)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "STRIPE",
  "MOOLRE",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
