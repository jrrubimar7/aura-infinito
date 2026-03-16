const CACHE='aura-v10';
self.addEventListener('install',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.map(c=>caches.delete(c)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim().then(()=>self.clients.matchAll({type:'window'}).then(cs=>cs.forEach(c=>c.navigate(c.url)))));});
self.addEventListener('fetch',e=>{});
