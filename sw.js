/*
 * Service Worker: بيخلّي الموقع يشتغل بدون إنترنت.
 *
 * أول مرة بينفتح الموقع وفي إنترنت، بنحفظ كل الملفات بالمتصفح.
 * بعدها: بنعطي النسخة المحفوظة فوراً (حتى لو ما في إنترنت)،
 * وإذا في إنترنت بنجيب النسخة الجديدة بالخلفية للمرة الجاية.
 *
 * ما بيشتغل على localhost (عشان التعديلات وقت التطوير تبين مباشرة)، إلا مع ?sw=1
 */
const CACHE = 'codeher-booth-v13';   // غيّروا الرقم مع كل نشر جديد

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/content.js',
  'js/stats.js',
  'js/daf.js',
  'js/quiz.js',
  'js/game.js',
  'js/app.js',
  'js/stutter-worklet.js',
  'js/voices.js',
  'assets/codeher-logo.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/tips-qr.png',
  'fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2',
  'fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2',
  'fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2',
  'fonts/ibm-plex-sans-arabic-latin-400-normal.woff2',
  'fonts/ibm-plex-sans-arabic-latin-500-normal.woff2',
  'fonts/ibm-plex-sans-arabic-latin-700-normal.woff2',
  'tips/',
  'tips/index.html'
];
// ملفات اختيارية: إذا مش موجودة ما بنوقف التثبيت
const OPTIONAL = [];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
    await Promise.all(OPTIONAL.map(f => cache.add(new Request(f, { cache: 'reload' })).catch(() => {})));
    // تسجيلات «تحدّي الصبر» (إذا موجودة)
    try {
      const r = await fetch('assets/voices/manifest.json', { cache: 'reload' });
      if (r.ok) {
        await cache.put('assets/voices/manifest.json', r.clone());
        const m = await r.json(), files = m.files || {};
        await Promise.all(Object.keys(m.clips || {}).map(id =>
          cache.add(new Request('assets/voices/' + (files[id] || id + '.webm'), { cache: 'reload' })).catch(() => {})));
      }
    } catch (e) { /* ما في تسجيلات */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('codeher-booth-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // ignoreSearch: «?v=4» على ملف المحاكاة، أو «?v=…» على الصفحة، بيلاقوا نفس الملف المحفوظ
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      // 206 (جزء من ملف صوت) ما بينحفظ
      if (res && res.status === 200 && res.type === 'basic') cache.put(url.pathname, res.clone());
      return res;
    }).catch(() => null);

    if (cached) {
      event.waitUntil(network);           // تحديث بالخلفية للمرة الجاية
      return cached;
    }
    const fresh = await network;
    if (fresh) return fresh;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
