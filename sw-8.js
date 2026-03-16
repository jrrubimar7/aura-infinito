const CACHE = 'aura-v8';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Borrado nuclear al instalar — fuerza versión nueva siempre
self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// URLs que nunca se cachean
const NO_CACHE = [
  'api.groq.com',
  'openrouter.ai',
  'together.xyz',
  'api.duckduckgo.com',
  'wttr.in',
  'js.puter.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if(NO_CACHE.some(h => url.includes(h))) return; // pass-through

  // Network first — siempre intenta red, cache como fallback offline
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(r => {
        if(r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'AURA ∞.Ω', body: 'Mensaje de AURA' };
  e.waitUntil(self.registration.showNotification(data.title || 'AURA ∞.Ω', {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
