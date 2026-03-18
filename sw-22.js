const CACHE = 'aura-v12';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll({type:'window'}).then(clients => {
          clients.forEach(client => client.navigate(client.url));
        });
      })
  );
});

const NO_CACHE = ['api.groq.com','openrouter.ai','anthropic.com','duckduckgo.com',
  'wttr.in','fonts.googleapis.com','nominatim.openstreetmap.org',
  'github.com','emergent','pipedapi','allorigins','generativelanguage.googleapis.com',
  'workers.dev','elevenlabs.io','binance.com'];

self.addEventListener('fetch', e => {
  if(NO_CACHE.some(h => e.request.url.includes(h))) return;
  e.respondWith(
    fetch(e.request, {cache:'no-store'})
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
