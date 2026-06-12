import { NextRequest, NextResponse } from "next/server";
import { logAssistantChat } from "@/lib/assistant/log";
import { buildAssistantReply } from "@/lib/assistant/respond";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    sessionId?: string;
    pagePath?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const result = await buildAssistantReply(message);

  void logAssistantChat({
    sessionId: body.sessionId,
    message,
    reply: result.reply,
    intent: result.intent,
    matchedProductSlugs: result.products?.map((p) => p.slug),
    pagePath: body.pagePath,
    userAgent: req.headers.get("user-agent") ?? undefined,
    addToCartOffered: result.addToCartOffered ?? false,
  });

  return NextResponse.json(result);
}
