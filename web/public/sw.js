/**
 * Fever HQ — service worker.
 *
 * Responsibilities:
 *   1. Receive push events and display branded notifications.
 *   2. Open the app on notification click.
 *   3. Basic offline shell (cache last-loaded page so re-open never shows
 *      a hard error if the user has no network).
 */

// Bump version whenever sw.js changes — triggers activate → old cache cleanup.
const SHELL = "feverhq-shell-v2";
// Only pre-cache truly static assets at install. SSR pages ("/", "/schedule")
// are NOT pre-cached here because they're time-sensitive and a stale
// install-time snapshot would serve outdated content as the offline fallback.
// Instead, pages are cached on first successful visit (see fetch handler).
const STATIC_ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never intercept API calls.
  if (url.pathname.startsWith("/api/")) return;
  // Network-first: always try to fetch fresh content.
  // On success, update the cache so the offline fallback stays current.
  // On failure, serve the last cached version (or the cached root as last resort).
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(SHELL).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Fever HQ", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Fever HQ";
  const opts = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag,
    renotify: true,
    data: data.data || { url: "/" },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.endsWith(target) && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
