// sw.js - Service Worker untuk menghapus ?m=1
const CACHE_NAME = 'blogger-cache-v1';
const PARAMS_TO_REMOVE = ['m', 'm=1'];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll([
                    '/',
                    '/index.html'
                ]);
            })
    );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    
    // Hapus parameter yang tidak diinginkan
    PARAMS_TO_REMOVE.forEach(param => {
        if(url.searchParams.has(param)) {
            url.searchParams.delete(param);
        }
    });

    // Jika URL berubah, redirect secara internal
    if(url.toString() !== event.request.url) {
        event.respondWith(
            fetch(url)
                .then(response => {
                    // Simpan ke cache
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(url, responseClone));
                    return response;
                })
                .catch(() => caches.match(url))
        );
        return;
    }

    // Cache-first strategy untuk permintaan lainnya
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});
