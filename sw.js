const CACHE = 'aura-v9';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE).then(c => c.addAll(['/index.html']).catch(()=>{})))
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

const NO_CACHE = ['api.groq.com','openrouter.ai','together.xyz','duckduckgo.com',
  'wttr.in','js.puter.com','fonts.googleapis.com','fonts.gstatic.com',
  'nominatim.openstreetmap.org','pipedapi','allorigins','anthropic.com',
  'github.com','emergent'];

self.addEventListener('fetch', e => {
  if(NO_CACHE.some(h => e.request.url.includes(h))) return;
  e.respondWith(
    fetch(e.request, {cache:'no-store'})
      .then(r => {
        if(r && r.status===200){
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
