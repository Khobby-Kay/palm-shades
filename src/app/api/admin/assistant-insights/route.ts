import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { hasDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  if (!hasDatabase()) {
    return NextResponse.json({
      logs: [],
      stats: { total: 0, last7Days: 0, addToCartOffers: 0, topIntents: [] },
      topQueries: [],
      warning: "DATABASE_URL not configured",
    });
  }

  try {
    const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10) || 100));

  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);

  const [logs, total, last7Days, addToCartOffers, intentGroups, recentMessages] =
    await Promise.all([
      prisma.assistantChatLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.assistantChatLog.count(),
      prisma.assistantChatLog.count({ where: { createdAt: { gte: since7 } } }),
      prisma.assistantChatLog.count({ where: { addToCartOffered: true } }),
      prisma.assistantChatLog.groupBy({
        by: ["intent"],
        _count: { intent: true },
        orderBy: { _count: { intent: "desc" } },
        take: 8,
      }),
      prisma.assistantChatLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { message: true },
      }),
    ]);

  const queryCounts = new Map<string, number>();
  for (const row of recentMessages) {
    const key = row.message.trim().toLowerCase().slice(0, 120);
    if (!key) continue;
    queryCounts.set(key, (queryCounts.get(key) ?? 0) + 1);
  }
  const topQueries = [...queryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([message, count]) => ({ message, count }));

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      message: l.message,
      reply: l.reply,
      intent: l.intent,
      matchedProductSlugs: l.matchedProductSlugs,
      pagePath: l.pagePath,
      sessionId: l.sessionId,
      addToCartOffered: l.addToCartOffered,
      createdAt: l.createdAt.toISOString(),
    })),
    stats: {
      total,
      last7Days,
      addToCartOffers,
      topIntents: intentGroups.map((g) => ({
        intent: g.intent ?? "unknown",
        count: g._count.intent,
      })),
    },
    topQueries,
  });
  } catch (err) {
    console.error("[assistant-insights]", err);
    return NextResponse.json(
      {
        logs: [],
        stats: { total: 0, last7Days: 0, addToCartOffers: 0, topIntents: [] },
        topQueries: [],
        warning:
          "Assistant log table missing — run prisma db push or scripts/create-assistant-chat-log.sql in Supabase.",
      },
      { status: 200 }
    );
  }
}
