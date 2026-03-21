const CACHE_NAME = "aura-cache-v21";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });
    for (const client of clients) {
      client.navigate(client.url);
    }
    console.log("[SW] v21 — modo local, sin Puter");
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await cache.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
