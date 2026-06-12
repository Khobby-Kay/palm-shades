import { purgePwaState } from "@/lib/pwa-cache";

const STORAGE_KEY = "palm-shades-chunk-reload";

export function isStaleChunkError(text: string): boolean {
  const m = text.toLowerCase();
  return (
    m.includes("reading 'call'") ||
    m.includes("chunkloaderror") ||
    m.includes("loading chunk") ||
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("failed to load chunk") ||
    m.includes("cannot find module") ||
    m.includes("__webpack_modules__")
  );
}

export function isHydrationMismatch(text: string): boolean {
  const m = text.toLowerCase();
  return (
    m.includes("hydration") ||
    m.includes("minified react error") ||
    m.includes("text content does not match") ||
    m.includes("did not match")
  );
}

export function isRecoverableClientError(text: string): boolean {
  return isStaleChunkError(text) || isHydrationMismatch(text);
}

export function errorTextFromUnknown(reason: unknown): string {
  if (typeof reason === "string") return reason;
  if (reason instanceof Error) {
    return `${reason.name}: ${reason.message}\n${reason.stack ?? ""}`;
  }
  if (reason && typeof reason === "object") {
    const obj = reason as { message?: string; stack?: string };
    if (obj.message) return `${obj.message}\n${obj.stack ?? ""}`;
  }
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

export function errorTextFromEvent(event: ErrorEvent): string {
  const parts = [
    event.message,
    errorTextFromUnknown(event.error),
    event.filename,
    event.lineno ? `line ${event.lineno}` : "",
  ].filter(Boolean);
  return parts.join("\n");
}

export function isNextStaticChunkTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLScriptElement)) return false;
  return target.src.includes("/_next/static/");
}

/** Reload once after clearing SW/cache; avoids infinite reload loops. */
export function recoverFromClientError(
  text: string,
  opts?: { fromNextChunk?: boolean; purgePwa?: boolean }
): void {
  const combined = opts?.fromNextChunk
    ? `${text}\n/_next/static/`
    : text;

  if (!isRecoverableClientError(combined)) return;

  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode — still try reload */
  }

  const reload = () => window.location.reload();

  if (opts?.purgePwa ?? process.env.NODE_ENV === "production") {
    void purgePwaState().finally(reload);
  } else {
    reload();
  }
}
