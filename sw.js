const CACHE = 'p10-v2';

// Ao instalar, não pré-cacheia nada — busca sob demanda
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Remove caches de versões antigas
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // NETWORK-FIRST: sempre tenta a rede primeiro
  // Só usa cache se estiver offline (fallback)
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Atualiza o cache com a resposta mais recente
        if (resp && resp.status === 200 && e.request.method === 'GET') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => {
        // Offline: usa o cache como fallback
        return caches.match(e.request);
      })
  );
});
