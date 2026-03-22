self.addEventListener('install', event => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] activate');

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          console.log('[SW] deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // No cache: siempre red directa
  event.respondWith(fetch(event.request));
});
