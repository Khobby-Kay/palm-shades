/**
 * Run Prisma queries one at a time.
 * Required on Supabase/Vercel when DATABASE_URL uses connection_limit=1 —
 * parallel Promise.all calls exhaust the pool and throw P2024.
 */
export async function prismaSequential<T extends readonly unknown[] | []>(
  tasks: { [K in keyof T]: () => Promise<T[K]> }
): Promise<T> {
  const results = [] as unknown as T;
  for (let i = 0; i < tasks.length; i++) {
    (results as unknown[])[i] = await tasks[i]();
  }
  return results;
}
