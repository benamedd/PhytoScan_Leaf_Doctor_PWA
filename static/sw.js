const cacheName = 'leaf-analyzer-cache-v1';
const staticAssets = [
  '/',
  '/static/index.html',
  '/static/script.js',
  '/static/style.css', // If you have a CSS file
  '/static/manifest.json',
  // Add other static assets here (images, fonts, etc.)
];

self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== cacheName)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});