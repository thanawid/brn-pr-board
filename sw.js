const CACHE = "brn-pr-v6-firebase-auth";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./polish.css",
  "./responsive.css",
  "./auth.css",
  "./auth-bootstrap.js",
  "./auth-config.js",
  "./firebase-auth.js",
  "./app.js",
  "./polish.js",
  "./responsive.js",
  "./assets/icon-192.png",
  "./assets/mascot.png",
  "./stage3d.js",
  "./assets/vendor/three.min.js",
  "./assets/logoBN-01.png",
  "./assets/logoBN-02.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE).then((cache) => cache.put("./index.html", response.clone()));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
