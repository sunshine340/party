/**
 * Service Worker - 支持离线使用
 */

const CACHE_NAME = 'party-games-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/data.js',
    './js/werewolf.js',
    './js/undercover.js',
    './js/charades.js',
    './manifest.json'
];

// 安装 - 缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求 - 优先使用缓存
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 如果缓存中有，直接返回
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 否则从网络获取
                return fetch(event.request)
                    .then((response) => {
                        // 缓存新资源
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // 离线时返回缓存的首页
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
