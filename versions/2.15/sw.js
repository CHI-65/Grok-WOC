const CACHE = "woc-scaffolding-v28";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./images/wheel-mark.png",
  "./images/printed-wheel.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("version.json")) return;
  if (url.pathname.includes("/versions/") || url.pathname.endsWith("timelog.html")) return;
  const freshFirst = url.pathname.endsWith(".html") || url.pathname.endsWith("/") || url.pathname.endsWith("sw.js");
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
      return freshFirst ? fetched : (cached || fetched);
    })
  );
});
