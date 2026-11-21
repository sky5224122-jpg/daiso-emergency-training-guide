/* CLAUDE 산업안전지도사 — 오프라인 사용을 위한 서비스워커(GitHub Pages 전용)
   네트워크 우선, 실패하면 캐시 사용. 새 문항을 올리면 다음 접속 때 자동 갱신됩니다. */
const CACHE = 'claude-cse-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
