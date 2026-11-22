/* CLAUDE 산업안전지도사 — 오프라인 사용을 위한 서비스워커(GitHub Pages 전용)
   설치할 때 화면·문항 데이터·글꼴 설정을 한꺼번에 저장하고, 이후에는 네트워크 우선(실패 시 저장본)으로 동작합니다.
   새 문항을 올리면 다음 접속 때 자동 갱신됩니다. */
const CACHE = 'claude-cse-v3';
const CORE = ['./', './index.html', './CLAUDE-manifest.webmanifest', './CLAUDE-icon-180.png', './CLAUDE-icon-512.png', './data/CLAUDE-k16.enc.json'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE).catch(() => {});
    try { // index.html에서 데이터 스크립트 목록을 읽어 함께 저장
      const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
      const srcs = [...html.matchAll(/<script src="(data\/[^"]+)"/g)].map(m => './' + m[1]);
      await Promise.all(srcs.map(u => c.add(u).catch(() => {})));
    } catch (err) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k.startsWith('claude-cse-')) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
