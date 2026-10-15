/* Reajuste de Lonas — Plenart · aplicativo instalável (v2.0)
   Guarda a página e os arquivos no aparelho para abrir mesmo sem internet. */
const CACHE = 'reajuste-lonas-v2-0';
const BASE = ['./', 'REAJUSTE_LONAS.html', 'manifest.json', 'icone-192.png', 'icone-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(BASE.map(u => c.add(u).catch(()=>{}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.hostname.endsWith('.supabase.co')) return;   // dados sempre ao vivo
  const guardavel = url.origin === location.origin
    || url.hostname === 'cdn.jsdelivr.net'
    || url.hostname === 'cdnjs.cloudflare.com';
  e.respondWith(
    fetch(req).then(resp => {
      if(guardavel && resp && (resp.ok || resp.type === 'opaque')){
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia)).catch(()=>{});
      }
      return resp;
    }).catch(() =>
      caches.match(req).then(hit => {
        if(hit) return hit;
        if(req.mode === 'navigate') return caches.match('REAJUSTE_LONAS.html');
        return Response.error();
      })
    )
  );
});
