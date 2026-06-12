export const BUILD_TAG_STORAGE_KEY = "palm-shades-build-tag";

export function readBuildTagFromDom(): string {
  if (typeof document === "undefined") return "";
  return (
    document
      .querySelector('meta[name="palm-shades-build"]')
      ?.getAttribute("content")
      ?.trim() ?? ""
  );
}

export async function purgePwaState(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

/** After a new deploy, clear stale SW/HTML/chunk caches and reload once. */
export async function ensureFreshBuild(): Promise<boolean> {
  const tag = readBuildTagFromDom();
  if (!tag) return false;

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(BUILD_TAG_STORAGE_KEY);
  } catch {
    return false;
  }

  if (stored === tag) return false;

  try {
    localStorage.setItem(BUILD_TAG_STORAGE_KEY, tag);
  } catch {
    /* private mode */
  }

  await purgePwaState();
  window.location.reload();
  return true;
}
