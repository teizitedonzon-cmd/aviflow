const CACHE_NAME = "aviflow-assets-v2";
const URLS_A_METTRE_EN_CACHE = ["/login", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_A_METTRE_EN_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Seuls les fichiers statiques publics sont mis en cache. Les réponses API et les
// pages authentifiées restent hors cache pour ne jamais exposer les données d'un
// producteur à un autre utilisateur du même appareil.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const estFichierStatique = ["script", "style", "image", "font"].includes(event.request.destination);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || !estFichierStatique) return;

  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        if (!reponse.ok) return reponse;
        const copie = reponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// Réception d'une notification push (alertes critiques)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "AviFlow", {
      body: data.body || "",
      icon: "/favicon.ico",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/dashboard"));
});
