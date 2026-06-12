import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import type { AssistantLogInput } from "@/lib/assistant/types";

export async function logAssistantChat(input: AssistantLogInput): Promise<void> {
  if (!hasDatabase()) return;

  const delegate = (prisma as { assistantChatLog?: { create: (args: unknown) => Promise<unknown> } })
    .assistantChatLog;
  if (!delegate) {
    console.warn(
      "[assistant] Prisma client missing assistantChatLog — restart `npm run dev` after `npx prisma generate`."
    );
    return;
  }

  try {
    await delegate.create({
      data: {
        sessionId: input.sessionId?.slice(0, 64) || null,
        message: input.message.slice(0, 2000),
        reply: input.reply.slice(0, 4000),
        intent: input.intent.slice(0, 64),
        matchedProductSlugs: input.matchedProductSlugs?.length
          ? input.matchedProductSlugs.join(",")
          : null,
        pagePath: input.pagePath?.slice(0, 512) || null,
        userAgent: input.userAgent?.slice(0, 512) || null,
        addToCartOffered: input.addToCartOffered ?? false,
      },
    });
  } catch (err) {
    console.error("[assistant] log failed:", err);
  }
}
