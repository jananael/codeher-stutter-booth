/*
 * أصوات «تحدّي الصبر» من ElevenLabs.
 *
 *   node tools/elevenlabs.js voices      ← قائمة الأصوات بحسابكم
 *   node tools/elevenlabs.js generate    ← بيولّد كل المقاطع حسب tools/elevenlabs.json
 *
 * المفتاح بيتقرأ من tools/elevenlabs-key.txt (ما بينطبع وما بينرفع على Netlify).
 * الملفات بتطلع بـ assets/voices/<id>.wav، والقائمة بـ assets/voices/manifest.json.
 * الأصوات السابقة بتتحفظ بـ tools/voices-before-elevenlabs قبل ما تنمسح.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VOICES = path.join(ROOT, 'assets', 'voices');
const KEY_FILE = path.join(__dirname, 'elevenlabs-key.txt');
const CFG_FILE = path.join(__dirname, 'elevenlabs.json');
const API = 'https://api.elevenlabs.io/v1';

function key() {
  const k = fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, 'utf8').trim() : '';
  if (!k) { console.error('المفتاح مش موجود بـ tools/elevenlabs-key.txt'); process.exit(1); }
  return k;
}

async function api(url, opts) {
  const res = await fetch(API + url, Object.assign({}, opts, {
    headers: Object.assign({ 'xi-api-key': key() }, (opts || {}).headers)
  }));
  if (!res.ok) {
    const body = await res.text();
    throw new Error(res.status + ' ' + body.slice(0, 300));
  }
  return res;
}

async function listVoices() {
  const j = await (await api('/voices')).json();
  const rows = (j.voices || []).map(v => {
    const l = v.labels || {};
    return [v.name, v.voice_id, l.gender || '', l.accent || '', l.age || '', l.description || l.descriptive || '', v.category || ''];
  });
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  console.log('name | voice_id | gender | accent | age | description | category');
  rows.forEach(r => console.log(r.join(' | ')));
}

/* ---------- WAV ---------- */
function pcmToWav(pcm, rate) {
  const b = Buffer.alloc(44 + pcm.length);
  b.write('RIFF', 0); b.writeUInt32LE(36 + pcm.length, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(pcm.length, 40);
  pcm.copy(b, 44);
  return b;
}

/** قصّ السكوت + توحيد العلوّ (نفس فكرة generate-voices.js، بدون تغيير بالنبرة). */
function tidy(wav) {
  const rate = wav.readUInt32LE(24);
  const n = (wav.length - 44) / 2;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = wav.readInt16LE(44 + i * 2) / 32768;
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  const th = Math.max(0.004, peak * 0.02), win = Math.round(rate * 0.01);
  const loud = k => { for (let j = k; j < Math.min(n, k + win); j++) if (Math.abs(x[j]) > th) return true; return false; };
  let a = 0, z = n;
  while (a < n && !loud(a)) a += win;
  while (z > a && !loud(Math.max(a, z - win))) z -= win;
  a = Math.max(0, a - Math.round(rate * 0.03));
  z = Math.min(n, z + Math.round(rate * 0.08));
  const y = x.slice(a, z);
  let s = 0, c = 0;
  for (const v of y) if (Math.abs(v) > th) { s += v * v; c++; }
  let g = c ? 0.11 / Math.sqrt(s / c) : 1, pk = 0;
  for (const v of y) pk = Math.max(pk, Math.abs(v));
  if (pk * g > 0.92) g = 0.92 / pk;
  const f = Math.min(Math.round(rate * 0.005), Math.floor(y.length / 2));
  const out = Buffer.alloc(y.length * 2);
  for (let i = 0; i < y.length; i++) {
    let v = y[i] * g;
    if (i < f) v *= i / f;
    if (i >= y.length - f) v *= (y.length - 1 - i) / f;
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2);
  }
  return { wav: pcmToWav(out, rate), seconds: y.length / rate };
}

async function generate() {
  const cfg = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
  const lines = Object.entries(cfg.lines);
  const missing = [...new Set(lines.map(([id]) => id.split('-')[1]))].filter(p => !(cfg.voices[p] || {}).voice_id);
  if (missing.length) { console.error('ما في voice_id لـ: ' + missing.join(', ') + ' (بـ tools/elevenlabs.json)'); process.exit(1); }

  // الأصوات الحالية على جنب
  const backup = path.join(__dirname, 'voices-before-elevenlabs');
  if (!fs.existsSync(backup)) {
    fs.mkdirSync(backup, { recursive: true });
    fs.readdirSync(VOICES).forEach(f => fs.copyFileSync(path.join(VOICES, f), path.join(backup, f)));
    console.log('backed up current voices to tools/voices-before-elevenlabs');
  }

  const manifest = { clips: {}, files: {} };
  const tmp = {};
  for (const [id, text] of lines) {
    const v = cfg.voices[id.split('-')[1]];
    const body = {
      text,
      model_id: cfg.model || 'eleven_multilingual_v2',
      voice_settings: Object.assign({ stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true }, cfg.voice_settings || {}, v.settings || {})
    };
    const res = await api('/text-to-speech/' + v.voice_id + '?output_format=pcm_22050', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'audio/pcm' }, body: JSON.stringify(body)
    });
    const pcm = Buffer.from(await res.arrayBuffer());
    tmp[id] = tidy(pcmToWav(pcm, 22050));
    console.log(id.padEnd(16) + tmp[id].seconds.toFixed(2) + 's  ' + text);
  }
  // كله نجح: هلأ بنستبدل الملفات
  fs.readdirSync(VOICES).filter(f => /\.(wav|webm)$/.test(f)).forEach(f => fs.unlinkSync(path.join(VOICES, f)));
  for (const [id, r] of Object.entries(tmp)) {
    fs.writeFileSync(path.join(VOICES, id + '.wav'), r.wav);
    manifest.clips[id] = Math.round(r.seconds * 1000) / 1000;
    manifest.files[id] = id + '.wav';
  }
  fs.writeFileSync(path.join(VOICES, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nDone: ' + lines.length + ' clips in assets/voices');
}

/** عيّنة سريعة: node tools/elevenlabs.js sample <voice_id> "<نص>" → tools/samples/<voice_id>.wav */
async function sample(voiceId, text) {
  const res = await api('/text-to-speech/' + voiceId + '?output_format=pcm_22050', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'audio/pcm' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true } })
  });
  const dir = path.join(__dirname, 'samples');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, voiceId + '.wav');
  fs.writeFileSync(out, tidy(pcmToWav(Buffer.from(await res.arrayBuffer()), 22050)).wav);
  console.log('saved ' + out);
}

const cmd = process.argv[2];
(cmd === 'voices' ? listVoices() : cmd === 'generate' ? generate() : cmd === 'sample' ? sample(process.argv[3], process.argv[4]) : Promise.reject(new Error('use: voices | generate')))
  .catch(e => { console.error('خطأ: ' + e.message); process.exit(1); });
