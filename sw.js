const CACHE_VERSION = '0.2.2'; // Este valor será reemplazado automáticamente
const CACHE_NAME = `linkhub-cache-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key.startsWith('linkhub-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
  // Informar versión tras activar
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'SW_VERSION', version: CACHE_VERSION }));
  });
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          if (event.request.method === 'GET' && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});

// Canal de mensajes para consultar la versión del SW
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'GET_SW_VERSION') {
    event.source && event.source.postMessage({ type: 'SW_VERSION', version: CACHE_VERSION });
  }
});
