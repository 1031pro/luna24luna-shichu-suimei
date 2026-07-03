const CACHE_NAME = "shichu-suimei-tool-v16";

const APP_SHELL = [
  "./",
  "./index.html",
  "./verification.html",
  "./manifest.webmanifest",
  "./styles/app.css",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "../assets/report/a4-landscape-ornament.png",
  "../assets/report/shichu-emblem.png",
  "./src/main.js",
  "./src/deploy-guard.js",
  "./src/auth.js",
  "./src/copy-guard.js",
  "./src/data/kanshi.js",
  "./src/data/kurokawa.js",
  "./src/data/profile.js",
  "./src/engine/chart.js",
  "./src/engine/kurokawa.js",
  "./src/engine/luck.js",
  "./src/engine/setsuiri.js",
  "./src/interpretation/generate.js",
  "./src/report/print.js",
  "./src/report/verification-page.js",
  "./src/report/verification-sheet.js",
  "./src/ui/render.js",
  "../data/setsuiri/setsuiri-1900-2200.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))),
  );
});
