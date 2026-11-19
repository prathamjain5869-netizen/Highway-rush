
const CACHE_NAME = "highway-rush-v1";

const FILES = [
  "./",
  "./index.html",
  "./sketch.js",
  "./style.css",
  "./p5.js",
  "./p5.sound.min.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
