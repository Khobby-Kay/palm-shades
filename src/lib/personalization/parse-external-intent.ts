import {
  categoriesForTerms,
  SOURCE_CATEGORY_HINTS,
  tokenizeIntentText,
} from "./intent-keywords";
import type { ExternalIntent } from "./types";

function hostSource(host: string): string | null {
  const h = host.toLowerCase();
  if (h.includes("google.")) return "google";
  if (h.includes("bing.com")) return "bing";
  if (h.includes("duckduckgo.")) return "duckduckgo";
  if (h.includes("youtube.") || h.includes("youtu.be")) return "youtube";
  if (h.includes("instagram.") || h === "l.instagram.com") return "instagram";
  if (h.includes("tiktok.")) return "tiktok";
  if (h.includes("facebook.") || h === "fb.com" || h === "l.facebook.com")
    return "facebook";
  if (h.includes("pinterest.")) return "pinterest";
  if (h.includes("twitter.") || h === "t.co" || h === "x.com") return "twitter";
  if (h.includes("whatsapp.")) return "whatsapp";
  if (h.includes("snapchat.")) return "snapchat";
  return null;
}

function queryFromReferrerUrl(url: URL, source: string): string[] {
  const terms: string[] = [];
  const q =
    url.searchParams.get("q") ??
    url.searchParams.get("p") ??
    url.searchParams.get("search_query") ??
    url.searchParams.get("query");
  if (q) terms.push(decodeURIComponent(q.replace(/\+/g, " ")));
  if (source === "youtube" && url.pathname.startsWith("/results")) {
    const yt = url.searchParams.get("search_query");
    if (yt) terms.push(yt);
  }
  return terms.filter(Boolean);
}

export function parseReferrerIntent(referrer: string): ExternalIntent | null {
  if (!referrer?.trim()) return null;
  try {
    const url = new URL(referrer);
    const source = hostSource(url.hostname);
    if (!source) return null;

    const rawTerms = queryFromReferrerUrl(url, source);
    const tokenTerms = rawTerms.flatMap((t) => tokenizeIntentText(t));
    const categoryHints = [
      ...categoriesForTerms([...rawTerms, ...tokenTerms]),
      ...(SOURCE_CATEGORY_HINTS[source] ?? []),
    ];

    return {
      source,
      label: source,
      terms: [...new Set([...rawTerms, ...tokenTerms])].slice(0, 12),
      categoryHints: [...new Set(categoryHints)].slice(0, 6),
      at: Date.now(),
    };
  } catch {
    return null;
  }
}

const URL_INTENT_PARAMS = [
  "q",
  "query",
  "search",
  "keyword",
  "kw",
  "interest",
  "utm_term",
  "utm_content",
  "utm_campaign",
  "ref",
  "from",
] as const;

export function parseLandingParamsIntent(
  searchParams: URLSearchParams
): ExternalIntent[] {
  const intents: ExternalIntent[] = [];
  const collected: string[] = [];

  for (const key of URL_INTENT_PARAMS) {
    const v = searchParams.get(key);
    if (v?.trim()) collected.push(v.trim());
  }

  if (collected.length === 0) return intents;

  const terms = collected.flatMap((t) => tokenizeIntentText(t));
  const categoryHints = categoriesForTerms(collected);

  intents.push({
    source: "landing",
    label: "your link",
    terms: [...new Set([...collected, ...terms])].slice(0, 12),
    categoryHints: [...new Set(categoryHints)].slice(0, 6),
    at: Date.now(),
  });

  const utmSource = searchParams.get("utm_source")?.toLowerCase();
  if (utmSource) {
    const social = hostSource(`${utmSource}.com`) ?? utmSource;
    const hints = SOURCE_CATEGORY_HINTS[social] ?? [];
    if (hints.length) {
      intents.push({
        source: social,
        label: utmSource,
        terms: collected.slice(0, 6),
        categoryHints: hints,
        at: Date.now(),
      });
    }
  }

  return intents;
}

export function captureSessionExternalIntents(): ExternalIntent[] {
  if (typeof window === "undefined") return [];

  const out: ExternalIntent[] = [];
  const ref = document.referrer;
  if (ref && !ref.includes(window.location.host)) {
    const parsed = parseReferrerIntent(ref);
    if (parsed) out.push(parsed);
  }

  out.push(...parseLandingParamsIntent(new URLSearchParams(window.location.search)));
  return out;
}
