/** Prisma / Supabase pooler errors that are safe to retry. */
export function isDbPoolError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: string }).code;
  return (
    code === "P2024" ||
    code === "P1001" ||
    error.message.includes("connection pool") ||
    error.message.includes("Timed out fetching a new connection") ||
    error.message.includes("Can't reach database server")
  );
}

export function dbRetryDelay(attempt: number): Promise<void> {
  const ms = Math.min(150 * attempt * attempt, 1200);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_ATTEMPTS = 4;

/** Retry transient pool / connectivity errors (used for $queryRaw and one-off calls). */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = DEFAULT_ATTEMPTS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isDbPoolError(error) || attempt === maxAttempts) throw error;
      await dbRetryDelay(attempt);
    }
  }
  throw lastError;
}
