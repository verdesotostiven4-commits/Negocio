const CACHE = "barrio-max-tv-v1";
const APP_SHELL = ["/tv", "/assets/logo-mark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const media = request.destination === "image";

  if (media) {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type !== "opaque") cache.put(request, response.clone());
      return response;
    }).catch(() => fetch(request)));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/tv"))));
});
