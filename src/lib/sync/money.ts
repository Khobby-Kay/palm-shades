/** Supabase/Tiwa prices are in major units (GHS); Prisma stores pesewas. */
export function majorToMinor(major: number | string | null | undefined): number {
  const n = Number(major ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function minorToMajor(minor: number): number {
  return minor / 100;
}
