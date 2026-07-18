const CACHE_NAME = 'todont-cache-v33';
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
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim(),
      checkBackgroundNotifications()
    ])
  );
});

// Fetch event - cache first strategy with dynamic caching for runtime requests
self.addEventListener('fetch', (e) => {
  // Only cache GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  // Trigger background check asynchronously
  e.waitUntil(checkBackgroundNotifications());

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

// Function to check if background notifications should be triggered
async function checkBackgroundNotifications() {
  try {
    const cache = await caches.open('todont-notification-cache');
    const response = await cache.match('/notification-state.json');
    if (!response) return;

    const data = await response.json();
    const now = Date.now();
    let updated = false;

    // Check 6-hour random active task notification
    const interval6h = 6 * 60 * 60 * 1000;
    if (now - data.last6hTime >= interval6h) {
      if (data.activeTasks && data.activeTasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.activeTasks.length);
        const randomTask = data.activeTasks[randomIndex];
        self.registration.showNotification("Constraint Reminder", {
          body: `Remember to avoid: ${randomTask}`,
          icon: './icon.svg'
        });
      }
      data.last6hTime = now;
      updated = true;
    }

    // Check 24-hour daily backlog notification
    const interval24h = 24 * 60 * 60 * 1000;
    if (now - data.last24hTime >= interval24h) {
      const activeCount = data.activeTasks ? data.activeTasks.length : 0;
      if (activeCount > 0) {
        self.registration.showNotification("To-Don't Daily Alert", {
          body: `You need to avoid these ${activeCount} tasks!`,
          icon: './icon.svg'
        });
      }
      data.last24hTime = now;
      updated = true;
    }

    if (updated) {
      await cache.put(
        '/notification-state.json',
        new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
  } catch (err) {
    console.error('Error checking service worker background notifications:', err);
  }
}

// Listen for messaging check triggers from the app
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'CHECK_NOTIFICATIONS') {
    e.waitUntil(checkBackgroundNotifications());
  }
});

// Listen for Periodic Sync triggers
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'todont-background-check') {
    e.waitUntil(checkBackgroundNotifications());
  }
});

// Listen for notification click to open or focus the PWA
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

