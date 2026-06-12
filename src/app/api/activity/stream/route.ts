import { getActivityVersion } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const POLL_MS = 10000;
const HEARTBEAT_MS = 15000;

function sseLine(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let lastVersion = 0;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const push = (text: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(text));
      };

      const tick = async () => {
        if (closed) return;
        try {
          const version = await getActivityVersion();
          if (version !== lastVersion) {
            lastVersion = version;
            push(sseLine({ version, changed: true }));
          }
        } catch {
          push(sseLine({ error: true }));
        }
      };

      // Send current version immediately on connect.
      void (async () => {
        try {
          lastVersion = await getActivityVersion();
          push(sseLine({ version: lastVersion, changed: false }));
        } catch {
          push(sseLine({ version: 0, changed: false }));
        }
      })();

      const pollId = setInterval(() => {
        void tick();
      }, POLL_MS);

      const heartbeatId = setInterval(() => {
        push(": heartbeat\n\n");
      }, HEARTBEAT_MS);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(pollId);
        clearInterval(heartbeatId);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
