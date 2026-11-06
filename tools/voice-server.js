/*
 * سيرفر صغير لتسجيل أصوات «تحدّي الصبر». بدون مكتبات، Node بس.
 *
 *   node tools/voice-server.js     ← بعدين افتحوا http://localhost:8099
 *
 * - بيعرض ملفات المشروع (عشان صفحة التسجيل تقرأ نفس الجمل من content.js)
 * - PUT  /voices/<id>.webm?d=<ثواني>  بيحفظ التسجيل بـ assets/voices وبيحدّث manifest.json
 * - DELETE /voices/<id>.webm          بيحذف تسجيل
 * بيشتغل على هاد الجهاز بس (localhost).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8099;
const ROOT = path.resolve(__dirname, '..');
const VOICES = path.join(ROOT, 'assets', 'voices');
const MANIFEST = path.join(VOICES, 'manifest.json');
const ID = /^(ar|en)-[a-z0-9]+-(rep)?\d+$/;
const MAX_BYTES = 10 * 1024 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2',
  '.webm': 'audio/webm', '.wav': 'audio/wav', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml'
};

fs.mkdirSync(VOICES, { recursive: true });

function readManifest() {
  try { const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); m.clips = m.clips || {}; m.files = m.files || {}; return m; }
  catch (e) { return { clips: {}, files: {} }; }
}
function writeManifest(m) {
  const clips = {}, files = {};
  Object.keys(m.clips).sort().forEach(k => { clips[k] = m.clips[k]; files[k] = (m.files || {})[k] || k + '.webm'; });
  fs.writeFileSync(MANIFEST, JSON.stringify({ clips, files }, null, 2));
}
function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const m = url.pathname.match(/^\/voices\/([^/]+)\.webm$/);

  if (m && (req.method === 'PUT' || req.method === 'DELETE')) {
    const id = m[1];
    if (!ID.test(id)) return send(res, 400, { error: 'bad id' });
    const file = path.join(VOICES, id + '.webm');

    if (req.method === 'DELETE') {
      try { fs.unlinkSync(file); } catch (e) { /* مش موجود */ }
      const man = readManifest();
      delete man.clips[id];
      delete man.files[id];
      writeManifest(man);
      return send(res, 200, { ok: true });
    }

    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BYTES) { req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const d = Math.max(0, Math.min(60, parseFloat(url.searchParams.get('d')) || 0));
      fs.writeFileSync(file, Buffer.concat(chunks));
      const man = readManifest();
      man.clips[id] = Math.round(d * 1000) / 1000;
      man.files[id] = id + '.webm';
      writeManifest(man);
      console.log('saved', id + '.webm', d.toFixed(2) + 's');
      send(res, 200, { ok: true, id, d });
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method' });
  if (url.pathname === '/') { res.writeHead(302, { Location: '/tools/recorder.html' }); return res.end(); }

  const filePath = path.resolve(ROOT, '.' + decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT)) return send(res, 403, { error: 'forbidden' });
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, { error: 'not found' });
    send(res, 200, data, TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  Voice recorder: http://localhost:' + PORT);
  console.log('  Recordings are saved to: ' + VOICES);
  console.log('  Keep this window open while recording.');
  console.log('');
});
