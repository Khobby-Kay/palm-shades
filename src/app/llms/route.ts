import { buildLlmsTxt } from "@/lib/seo";

export const revalidate = 86400;

/** Machine-readable site summary for AI assistants (served at /llms and /llms.txt). */
export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
