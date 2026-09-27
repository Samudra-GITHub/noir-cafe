/* Noir Café service worker.
 *
 * Offline:  the menu, the locations and an offline page are saved on install
 *           (with the scripts and styles they reference), so both keep
 *           working without a connection; every page visited is refreshed
 *           in the cache too.
 * Strategy: pages and RSC payloads — network first, cache fallback, then the
 *           offline page. Hashed build assets — cache first. Photography and
 *           video posters — stale-while-revalidate, capped. Films (range
 *           requests, large) and APIs are never cached.
 * Push:     shows notifications sent through /api/push and opens their link.
 */
const VERSION = "noir-v2";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const MEDIA = `${VERSION}-media`;
const OFFLINE_URL = "/offline";
const PRECACHE = ["/offline", "/menu", "/locations", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const MEDIA_LIMIT = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const assets = await caches.open(ASSETS);
      for (const url of PRECACHE) {
        try {
          const res = await fetch(url, { cache: "reload" });
          if (!res.ok) continue;
          await pages.put(url, res.clone());
          // Save the build assets each precached page needs to render offline.
          if ((res.headers.get("content-type") || "").includes("text/html")) {
            const html = await res.text();
            const refs = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
            await Promise.all([...new Set(refs)].map((u) => assets.add(u).catch(() => {})));
          }
        } catch {}
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || (url.pathname.startsWith("/videos/") && url.pathname.endsWith(".mp4"))) return;

  // Build assets: content-hashed, immutable.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        if (res.ok) caches.open(ASSETS).then((c) => c.put(request, res.clone()));
        return res;
      })),
    );
    return;
  }

  // Photography and posters: fast from cache, refreshed in the background.
  if (request.destination === "image" || url.pathname.startsWith("/_next/image")) {
    event.respondWith(
      caches.open(MEDIA).then(async (cache) => {
        const hit = await cache.match(request);
        const refresh = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone()).then(() => trim(MEDIA, MEDIA_LIMIT));
            return res;
          })
          .catch(() => hit);
        return hit || refresh;
      }),
    );
    return;
  }

  // Pages and RSC payloads: network first, then the saved copy, then offline.
  const isPage = request.mode === "navigate";
  const isRsc = request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
  if (isPage || isRsc) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        const key = isRsc ? request : url.pathname;
        try {
          const res = await fetch(request);
          if (res.ok && !isRsc) cache.put(key, res.clone());
          return res;
        } catch {
          const hit = await cache.match(key, { ignoreSearch: isPage });
          if (hit) return hit;
          // Redirect rather than answer in place, so the URL matches the page and
          // path-aware UI hydrates cleanly; /offline itself comes from the cache.
          if (isPage) return (await cache.match(OFFLINE_URL)) ? Response.redirect(OFFLINE_URL, 302) : Response.error();
          return Response.error();
        }
      })(),
    );
  }
});

// ── Push ────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Noir Café", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag,
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => w.url === target);
      return open ? open.focus() : self.clients.openWindow(target);
    })(),
  );
});
