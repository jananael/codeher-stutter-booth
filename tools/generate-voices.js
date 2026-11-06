/*
 * بيولّد أصوات «تحدّي الصبر» بصوت كمبيوتر أردني (Piper، مفتوح المصدر، بيشتغل بدون إنترنت).
 *
 *   node tools/generate-voices.js
 *
 * - نص النطق من tools/tts-lines.json
 * - Piper والصوت بـ %LOCALAPPDATA%\CodeHerBooth\piper (piper\piper.exe + ar_JO-kareem-medium.onnx)
 * - الملفات بتطلع بـ assets/voices/<id>.wav، والقائمة بـ assets/voices/manifest.json
 * - التسجيلات القديمة (webm) بتنتقل لـ tools/old-recordings بدل ما تنحذف
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VOICES = path.join(ROOT, 'assets', 'voices');
const OLD = path.join(__dirname, 'old-recordings');
const PIPER_DIR = path.join(process.env.LOCALAPPDATA || '', 'CodeHerBooth', 'piper');
const PIPER = path.join(PIPER_DIR, 'piper', 'piper.exe');
const MODEL = path.join(PIPER_DIR, 'ar_JO-kareem-medium.onnx');

if (!fs.existsSync(PIPER) || !fs.existsSync(MODEL)) {
  console.error('Piper مش موجود بـ ' + PIPER_DIR);
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'tts-lines.json'), 'utf8'));
fs.mkdirSync(VOICES, { recursive: true });

// التسجيلات القديمة على جنب
const old = fs.readdirSync(VOICES).filter(f => f.endsWith('.webm'));
if (old.length) {
  fs.mkdirSync(OLD, { recursive: true });
  old.forEach(f => fs.renameSync(path.join(VOICES, f), path.join(OLD, f)));
  console.log('moved ' + old.length + ' old recordings to tools/old-recordings');
}
fs.readdirSync(VOICES).filter(f => f.endsWith('.wav')).forEach(f => fs.unlinkSync(path.join(VOICES, f)));

/** مدّة ملف WAV بالثواني (من الهيدر). */
function wavSeconds(file) {
  const b = fs.readFileSync(file);
  const rate = b.readUInt32LE(24), byteRate = b.readUInt32LE(28);
  let i = 12;
  while (i < b.length - 8) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === 'data') return size / byteRate;
    i += 8 + size;
  }
  return (b.length - 44) / (rate * 2);
}

/* ---------- معالجة الصوت بعد التوليد ----------
 * ١) وضوح: قصّ الترددات الواطية جداً + رفع خفيف للترددات العالية (الصوت بيطلع أقل كتمة)
 * ٢) قصّ السكوت الزايد ببداية وآخر المقطع
 * ٣) توحيد العلوّ بين كل المقاطع
 */
const FX = Object.assign({ highpassHz: 90, shelfHz: 3000, shelfDb: 4, targetRms: 0.11, maxPeak: 0.92,
  trimThreshold: 0.02, padStartMs: 30, padEndMs: 70 }, cfg.processing || {});

function readWav(file) {
  const b = fs.readFileSync(file);
  let i = 12, fmt = null, data = null;
  while (i < b.length - 8) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === 'fmt ') fmt = { channels: b.readUInt16LE(i + 10), rate: b.readUInt32LE(i + 12), bits: b.readUInt16LE(i + 22) };
    if (id === 'data') data = b.subarray(i + 8, i + 8 + size);
    i += 8 + size + (size % 2);
  }
  if (!fmt || !data || fmt.bits !== 16 || fmt.channels !== 1) throw new Error('unexpected wav format: ' + file);
  const x = new Float32Array(data.length / 2);
  for (let k = 0; k < x.length; k++) x[k] = data.readInt16LE(k * 2) / 32768;
  return { rate: fmt.rate, x };
}

function writeWav(file, rate, x) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  for (let k = 0; k < x.length; k++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[k] * 32767))), 44 + k * 2);
  fs.writeFileSync(file, b);
}

/** فلتر biquad (معادلات RBJ). */
function biquad(x, c) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let k = 0; k < x.length; k++) {
    const v = c.b0 * x[k] + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x[k]; y2 = y1; y1 = v; y[k] = v;
  }
  return y;
}
function highpass(rate, f0) {
  const w = 2 * Math.PI * f0 / rate, cs = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2);
  const a0 = 1 + al;
  return { b0: (1 + cs) / 2 / a0, b1: -(1 + cs) / a0, b2: (1 + cs) / 2 / a0, a1: -2 * cs / a0, a2: (1 - al) / a0 };
}
function highShelf(rate, f0, db) {
  const A = Math.pow(10, db / 40), w = 2 * Math.PI * f0 / rate, cs = Math.cos(w);
  const al = Math.sin(w) / 2 * Math.sqrt(2), sa = 2 * Math.sqrt(A) * al;
  const a0 = (A + 1) - (A - 1) * cs + sa;
  return {
    b0: A * ((A + 1) + (A - 1) * cs + sa) / a0, b1: -2 * A * ((A - 1) + (A + 1) * cs) / a0,
    b2: A * ((A + 1) + (A - 1) * cs - sa) / a0, a1: 2 * ((A - 1) - (A + 1) * cs) / a0,
    a2: ((A + 1) - (A - 1) * cs - sa) / a0
  };
}

function processClip(file) {
  const { rate, x: raw } = readWav(file);
  let x = biquad(raw, highpass(rate, FX.highpassHz));
  x = biquad(x, highShelf(rate, FX.shelfHz, FX.shelfDb));

  // قصّ السكوت: أول وآخر نافذة (١٠ مللي ث) فيها صوت فوق العتبة
  const win = Math.round(rate * 0.01);
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  const th = Math.max(0.004, peak * FX.trimThreshold);
  const loud = k => { for (let j = k; j < Math.min(x.length, k + win); j++) if (Math.abs(x[j]) > th) return true; return false; };
  let a = 0, z = x.length;
  while (a < x.length && !loud(a)) a += win;
  while (z > a && !loud(Math.max(a, z - win))) z -= win;
  a = Math.max(0, a - Math.round(rate * FX.padStartMs / 1000));
  z = Math.min(x.length, z + Math.round(rate * FX.padEndMs / 1000));
  x = x.slice(a, z);

  // توحيد العلوّ: RMS للأجزاء المسموعة بس، مع سقف للقمم
  let sum = 0, n = 0;
  for (const v of x) if (Math.abs(v) > th) { sum += v * v; n++; }
  const rms = n ? Math.sqrt(sum / n) : 0;
  let gain = rms ? FX.targetRms / rms : 1;
  let pk = 0;
  for (const v of x) pk = Math.max(pk, Math.abs(v));
  if (pk * gain > FX.maxPeak) gain = FX.maxPeak / pk;
  for (let k = 0; k < x.length; k++) x[k] *= gain;

  // دخول وخروج ناعم (٥ مللي ث) عشان ما في طقطقة بعد القصّ
  const f = Math.min(Math.round(rate * 0.005), Math.floor(x.length / 2));
  for (let k = 0; k < f; k++) { x[k] *= k / f; x[x.length - 1 - k] *= k / f; }

  writeWav(file, rate, x);
}

/* ---------- تنغيم: المقطع اللي بعده وقفة لازم ينقرأ «مكمّل» مش «خالص» ----------
 * آخر مقطع كلام لكل شخص بيضل بنهايته (نقطة)، والباقي بينتهي بفاصلة، فالصوت ما بينزل كأنه خلّص.
 */
const lastSay = {};
for (const id of Object.keys(cfg.lines)) {
  const m = id.match(/^(\w+)-(\w+)-(\d+)$/);
  if (m) lastSay[m[2]] = Math.max(lastSay[m[2]] || 0, Number(m[3]));
}
function withIntonation(id, text) {
  const m = id.match(/^(\w+)-(\w+)-(\d+)$/);
  if (!m || cfg.continueIntonation === false) return text;
  if (Number(m[3]) === lastSay[m[2]]) return text;
  return text.replace(/[\s.،,؟?!]+$/u, '') + '،';
}

const manifest = { clips: {}, files: {} };
for (const [id, rawText] of Object.entries(cfg.lines)) {
  const text = withIntonation(id, rawText);
  const person = id.split('-')[1];
  const v = Object.assign({}, cfg.defaults || {}, cfg.voices[person] || {});
  const out = path.join(VOICES, id + '.wav');
  // length_scale: أبطأ لما يكبر. noise_scale / noise_w: تنويع بالنبرة والإيقاع (أطبع، بس كثير بيصير غريب)
  const args = ['--model', MODEL, '--output_file', out,
    '--length_scale', String(v.length_scale || 1),
    '--noise_scale', String(v.noise_scale || 0.667),
    '--noise_w', String(v.noise_w || 0.8),
    '--sentence_silence', String(v.sentence_silence || 0.1)];
  const r = spawnSync(PIPER, args,
    { input: text, encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(out)) {
    console.error('فشل: ' + id + '\n' + (r.stderr || ''));
    process.exit(1);
  }
  processClip(out);
  const d = Math.round(wavSeconds(out) * 1000) / 1000;
  manifest.clips[id] = d;
  manifest.files[id] = id + '.wav';
  console.log(id.padEnd(16) + d.toFixed(2) + 's  ' + text);
}
fs.writeFileSync(path.join(VOICES, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('\nDone: ' + Object.keys(manifest.clips).length + ' clips in assets/voices');
