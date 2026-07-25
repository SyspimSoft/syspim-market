// Service Worker para Syspim Market Multi-Tenant
// Cache offline y notificaciones PWA

const CACHE_NAME = 'syspim-market-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './src/app.js',
    './src/config/supabase.js',
    './src/utils/helpers.js',
    './src/modules/admin/admin.js',
    './src/modules/catalog/catalog.js',
    './src/modules/delivery/delivery.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('[SW] Cache parcial instalado:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Cache First con Network Fallback
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                return networkResponse;
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});

self.addEventListener('push', event => {
    let data = {
        title: '🛵 Syspim Market Delivery',
        body: 'Tienes una nueva actualización de pedido.',
        tag: 'colmado-delivery'
    };

    if (event.data) {
        try { data = event.data.json(); } catch (err) { data.body = event.data.text(); }
    }

    const options = {
        body: data.body,
        tag: data.tag,
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
