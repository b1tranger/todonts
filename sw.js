const CACHE_NAME = 'todont-cache-v29';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './render.html',
  './render.js',
  './render.css',
  './documentation.md',
  './guide.md',

  // CDN Stylesheets & Scripts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js',

  // CDN Webfonts
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-brands-400.woff2',

  // Localized Fallback Dependencies
  './dependencies/marked.min.js',
  './dependencies/purify.min.js',
  './dependencies/highlight/highlight.min.js',
  './dependencies/highlight/github-dark.min.css',
  './dependencies/github-markdown.min.css',
  './dependencies/katex/katex.min.js',
  './dependencies/katex/auto-render.min.js',
  './dependencies/katex/katex.min.css',

  // Localized Font Awesome
  './dependencies/font-awesome/css/all.min.css',
  './dependencies/font-awesome/webfonts/fa-solid-900.woff2',
  './dependencies/font-awesome/webfonts/fa-regular-400.woff2',
  './dependencies/font-awesome/webfonts/fa-brands-400.woff2',

  // Localized KaTeX Fonts
  './dependencies/katex/fonts/KaTeX_Main-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Main-Bold.woff2',
  './dependencies/katex/fonts/KaTeX_Main-Italic.woff2',
  './dependencies/katex/fonts/KaTeX_Math-Italic.woff2',
  './dependencies/katex/fonts/KaTeX_Size1-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Size2-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Size3-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Size4-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_AMS-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Script-Regular.woff2',
  './dependencies/katex/fonts/KaTeX_Typewriter-Regular.woff2',

  // Localized Google Fonts CSS and Files
  './dependencies/google-fonts.css',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2',
  './dependencies/google-fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx3cwhsk.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx7cwhsk.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxPcwhsk.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxTcwhsk.woff2',
  './dependencies/google-fonts/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx_cwhsk.woff2'
];

// Install event - caching static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache first strategy with dynamic caching for runtime requests
self.addEventListener('fetch', (e) => {
  // Only cache GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // If we got a valid response, cache it dynamically for subsequent offline loads
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback if network fails and resource is not cached
        return new Response('Offline content not available.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});
