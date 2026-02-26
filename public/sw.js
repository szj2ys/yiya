// Yiya Service Worker — minimal, manual implementation (no workbox)
const CACHE_NAME = "yiya-v1";
const STATIC_ASSETS = ["/learn", "/icon-192.png", "/icon-512.png", "/mascot.svg"];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for everything else
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip non-http(s) requests (e.g. chrome-extension://)
  if (!request.url.startsWith("http")) return;

  // Cache-first for static assets (images, fonts, CSS, JS)
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for navigation and API calls
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Push: display notification
self.addEventListener("push", (event) => {
  const defaultPayload = {
    title: "Yiya",
    body: "Time to practice!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/learn" },
  };

  let payload = defaultPayload;
  try {
    if (event.data) {
      payload = { ...defaultPayload, ...event.data.json() };
    }
  } catch {
    // If JSON parsing fails, try as text
    if (event.data) {
      payload = { ...defaultPayload, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
    })
  );
});

// Notification click: open /learn
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/learn";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if found
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return self.clients.openWindow(url);
    })
  );
});
