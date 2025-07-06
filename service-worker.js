const cacheName = 'motoboy-cash-v1';
const filesToCache = [
  '/Motoboy-Cash/',
  '/Motoboy-Cash/index.html',
  '/Motoboy-Cash/css/style.css',
  '/Motoboy-Cash/js/script.js',
  '/Motoboy-Cash/icon-192.png',
  '/Motoboy-Cash/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
