/**
 * SomaUG Academic PWA Service Worker
 * Version: somaug-v1.0.1
 * Provides offline application shell, safe caching, and offline fallback.
 *
 * SECURITY INVARIANT:
 * This service worker NEVER caches private document binary chunks (/api/documents/.../encrypted-chunks/...)
 * or authenticated wallet transactions in CacheStorage. Encrypted chunks reside strictly
 * within IndexedDB, governed by authenticated Offline Licenses.
 */

const CACHE_NAME_SHELL = "somaug-shell-v1";
const CACHE_NAME_STATIC = "somaug-static-v1";

const PRECACHE_URLS = [
  "/",
  "/student/dashboard",
  "/student/library",
  "/student/profile",
  "/offline.html",
  "/manifest.json",
];

// URLs that must NEVER be touched by CacheStorage
const EXCLUDED_PATTERNS = [
  /\/api\/documents\/.*\/encrypted-chunks/,
  /\/api\/documents\/.*\/download-auth/,
  /\/api\/wallet/,
  /\/api\/admin/,
  /\/api\/auth/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_SHELL).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Continue even if precache routes fail during initial build
        console.warn("Precache partial warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) => name !== CACHE_NAME_SHELL && name !== CACHE_NAME_STATIC
          )
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Strictly bypass excluded sensitive endpoints
  for (const pattern of EXCLUDED_PATTERNS) {
    if (pattern.test(url.pathname)) {
      return; // Fall through to standard network fetch
    }
  }

  // 2. Only cache GET requests
  if (request.method !== "GET") {
    return;
  }

  // 3. Static assets: Cache-First strategy
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(css|js|woff2|woff|ttf|svg|png|jpg|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== "basic"
            ) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME_STATIC).then((cache) => {
              cache.put(request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            return new Response("", { status: 408, statusText: "Offline" });
          });
      })
    );
    return;
  }

  // 4. HTML Navigation: Network-First with Stale Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME_SHELL).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check cached version of this exact URL
          const cached = await caches.match(request);
          if (cached) return cached;

          // If offline and not in cache, deliver dedicated offline fallback shell
          const offlinePage = await caches.match("/offline.html");
          if (offlinePage) return offlinePage;

          return new Response(
            "<html><body><h1>Offline Mode</h1><p>Please check your internet connection.</p></body></html>",
            {
              headers: { "Content-Type": "text/html" },
            }
          );
        })
    );
    return;
  }
});

