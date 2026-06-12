/**
 * Palm Shades service worker — offline-capable storefront.
 *
 * Strategy:
 *  - Storefront page navigations: network-first, fall back to the cached page,
 *    then to /offline.html. This keeps online users on fresh HTML (no stale
 *    chunk bugs) while letting them revisit pages they've already opened offline.
 *  - Images: cache-first with runtime caching (capped), so product photos load
 *    instantly and remain available offline.
 *  - /images/: cache-first.
 *  - /_next/static/: never cached (webpack chunks go stale after rebuilds).
 *  - Admin / account / checkout / API / RSC payloads: never cached (always live).
 */

const VERSION = "v1";
const STATIC_CACHE = `palm-shades-static-${VERSION}`;
const PAGE_CACHE = `palm-shades-pages-${VERSION}`;
const IMAGE_CACHE = `palm-shades-images-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = ["/offline.html"];
const ALLOWED_CACHES = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE];

const MAX_PAGES = 60;
const MAX_IMAGES = 120;
const MAX_STATIC = 250;

function isPrivatePath(pathname) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-success") ||
    pathname.startsWith("/api")
  );
}

function isImage(pathname) {
  return /\.(png|jpe?g|webp|gif|svg|ico|avif)$/i.test(pathname);
}

function isBundledChunk(pathname) {
  return pathname.startsWith("/_next/static/");
}

function isRscRequest(url, request) {
  return (
    url.search.includes("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    !!request.headers.get("Next-Router-State-Tree")
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (let i = 0; i < keys.length - maxEntries; i += 1) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !ALLOWED_CACHES.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (isPrivatePath(url.pathname)) return;
  if (isRscRequest(url, request)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // Never intercept webpack chunks — cache-first here caused
  // "Cannot read properties of undefined (reading 'call')" after dev rebuilds.
  if (isBundledChunk(url.pathname)) return;

  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  if (url.pathname.startsWith("/images/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, MAX_STATIC));
  }
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) return response;
    throw new Error("network response not ok");
  } catch {
    // Do not serve cached HTML — stale pages reference deleted webpack chunks.
    const offline = await caches.match(OFFLINE_URL);
    return (
      offline ||
      new Response("You are offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone());
      void trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}
