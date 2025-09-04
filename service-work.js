const CACHE_NAME = "conhecendocidade";
const FILES_TO_CACHE = [
  "/",
  "/icons",
  "index.html",
  "styles.css",
  "app.js"    
];

// Instalação dos arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativação e remoção dos caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache para evitar problemas com a tecla F5
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Para navegação (HTML) 
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((resp) => resp || caches.match())
      )
    );
  } else {
    // Para  arquivos estáticos → Cache First
    event.respondWith(
      caches.match(event.request).then((resp) => {
        return (
          resp ||
          fetch(event.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
  }
});
