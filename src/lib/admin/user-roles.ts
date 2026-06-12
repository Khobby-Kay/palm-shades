import { z } from "zod";
import { USER_ROLES, type UserRole } from "@/lib/types/enums";

export const roleUpdateSchema = z.object({
  role: z.enum(USER_ROLES),
});

export function parseUserRole(value: string): UserRole | null {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}
