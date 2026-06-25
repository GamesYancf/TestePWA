const CACHE_NAME = 'mini-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '.',
  'index.html',
  'other.html',
  'main.js',
  'style.css',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clonedResponse = response.clone();
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('index.html')))
  );
});
