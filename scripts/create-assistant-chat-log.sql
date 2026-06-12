-- Run in Supabase SQL editor if `prisma db push` fails.
-- Creates the shopping assistant chat log table.

CREATE TABLE IF NOT EXISTS "AssistantChatLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "message" TEXT NOT NULL,
    "reply" TEXT,
    "intent" TEXT,
    "matchedProductSlugs" TEXT,
    "pagePath" TEXT,
    "userAgent" TEXT,
    "addToCartOffered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssistantChatLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AssistantChatLog_createdAt_idx"
  ON "AssistantChatLog"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "AssistantChatLog_intent_idx"
  ON "AssistantChatLog"("intent");

CREATE INDEX IF NOT EXISTS "AssistantChatLog_sessionId_idx"
  ON "AssistantChatLog"("sessionId");
