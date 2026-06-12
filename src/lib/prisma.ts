import "./resolve-database-env";
import { PrismaClient } from "@prisma/client";
import { dbRetryDelay, isDbPoolError, withDbRetry } from "@/lib/prisma-errors";

const MAX_DB_ATTEMPTS = 4;

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          let lastError: unknown;
          for (let attempt = 1; attempt <= MAX_DB_ATTEMPTS; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              lastError = error;
              if (!isDbPoolError(error) || attempt === MAX_DB_ATTEMPTS) {
                throw error;
              }
              await dbRetryDelay(attempt);
            }
          }
          throw lastError;
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function isStalePrismaClient(
  client: ReturnType<typeof createPrismaClient> | undefined
): boolean {
  if (!client) return false;
  return !("assistantChatLog" in client && client.assistantChatLog);
}

function getPrismaClient(): ReturnType<typeof createPrismaClient> {
  if (isStalePrismaClient(globalForPrisma.prisma)) {
    void globalForPrisma.prisma?.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();

/** Raw SQL with the same pool retry policy as model queries. */
export async function prismaQueryRaw<T>(
  query: TemplateStringsArray,
  ...values: unknown[]
): Promise<T> {
  return withDbRetry(() => prisma.$queryRaw<T>(query, ...values));
}

export { isDbPoolError, withDbRetry } from "@/lib/prisma-errors";
