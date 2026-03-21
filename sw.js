const CACHE_NAME = "aura-cache-v20";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    // Borra caches antiguas
    await Promise.all(
      keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );

    // Toma control inmediato
    await self.clients.claim();

    // Fuerza recarga de todas las pestañas abiertas
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of clients) {
      client.navigate(client.url);
    }

    console.log("[SW] limpio y actualizado");
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo interceptar GET
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      // Siempre intenta red primero sin caché
      const fresh = await fetch(req, { cache: "no-store" });
      cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      // Si falla, usa caché
      const cached = await cache.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
