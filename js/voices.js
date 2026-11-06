/*
 * أصوات «تحدّي الصبر».
 *
 * كل موقف بيتقسّم لمقاطع عند الوقفات والتكرار:
 *   say   = كلمات بتنحكى (بتتسجّل بصوت حقيقي)
 *   pause = وقفة سكوت (ما بتتسجّل، اللعبة بتعملها)
 *   rep   = تكرار مقطع مثل «كـ.. كـ..» (تسجيله اختياري)
 *
 * التسجيلات بـ assets/voices/<id>.webm، وقائمتها ومدّة كل واحد بـ assets/voices/manifest.json
 * صفحة التسجيل (recorder.html) واللعبة بيستعملوا نفس التقسيم، عشان الأسماء تضل متطابقة.
 *
 * التسجيلات بتمرق بمعالج المحاكاة (js/stutter-worklet.js) عشان نضيف عليها تأتأة
 * (تكرار ومدّ ووقفات). القوة من content.js ← game.voiceStutter (٠ = بدون).
 */
window.Voices = (function () {
  // نفس رقم WORKLET_VERSION بـ daf.js
  const WORKLET_URL = 'js/stutter-worklet.js?v=5';

  let clips = {};            // id → مدّة بالثواني
  let files = {};            // id → اسم الملف (wav من صوت الكمبيوتر، أو webm من صفحة التسجيل)
  const audios = {};         // id → Audio محمّل مسبقاً

  /** بيقسّم موقف لمقاطع. الـ id: <لغة>-<شخص>-<رقم>، مثلاً ar-layan-2 */
  function segments(round, lang) {
    const base = (lang || window.LANG || 'ar') + '-' + round.id + '-';
    const out = [];
    let cur = [], n = 0;
    const flush = () => {
      if (cur.length) { out.push({ type: 'say', words: cur, id: base + (++n) }); cur = []; }
    };
    for (const item of round.words) {
      if (typeof item === 'string') { cur.push(item); continue; }
      if (item.block) {
        flush();
        out.push({ type: 'pause', ms: item.block, guess: item.guess || null });
      }
      if (item.rep) {
        flush();
        out.push({ type: 'rep', text: item.rep, word: item.w, id: base + 'rep' + (++n) });
      }
      cur.push(item.w);
    }
    flush();
    return out;
  }

  async function load() {
    try {
      const r = await fetch('assets/voices/manifest.json', { cache: 'no-cache' });
      if (r.ok) { const m = await r.json(); clips = m.clips || {}; files = m.files || {}; }
    } catch (e) { clips = {}; files = {}; }
    return clips;
  }

  const has = id => Object.prototype.hasOwnProperty.call(clips, id);
  const duration = id => clips[id] || 0;
  const url = id => 'assets/voices/' + (files[id] || id + '.webm');

  function audioFor(id) {
    if (!audios[id]) {
      const a = new Audio(url(id));
      a.preload = 'auto';
      audios[id] = a;
    }
    return audios[id];
  }

  /** تحميل مسبق لمقاطع موقف، عشان ما يصير تأخير وقت التشغيل. */
  function prepare(segs) {
    segs.forEach(s => { if (s.id && has(s.id)) audioFor(s.id); });
  }

  /* ---------- معالج التأتأة ---------- */
  const level = () => {
    const v = window.CONTENT && window.CONTENT.game ? window.CONTENT.game.voiceStutter : 0;
    return Number(v) || 0;
  };
  let ctx = null, node = null, fxReady = null, inEvent = false, onEvent = null, lagWaiter = null;
  const sources = new WeakMap();

  function ensureFx() {
    if (level() <= 0) return Promise.resolve(false);
    if (fxReady) return fxReady;
    fxReady = (async () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !window.AudioWorkletNode) return false;
      ctx = new AC({ latencyHint: 'interactive' });
      await ctx.audioWorklet.addModule(WORKLET_URL);
      node = new AudioWorkletNode(ctx, 'stutter-processor', {
        numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1],
        channelCount: 1, channelCountMode: 'explicit'
      });
      node.port.postMessage({ level: level() });
      node.port.onmessage = e => {
        const d = e.data || {};
        if (d.ev) {
          inEvent = d.ev === 'start';
          if (onEvent) onEvent(d.ev);
        }
        if ('lag' in d && lagWaiter) { lagWaiter(d.lag); lagWaiter = null; }
      };
      node.connect(ctx.destination);
      return true;
    })().catch(() => { fxReady = null; return false; });
    return fxReady;
  }

  /** قديش في صوت لسا بالمعالج ما طلع (ثواني). */
  function pendingLag() {
    return new Promise(resolve => {
      lagWaiter = resolve;
      node.port.postMessage({ debug: true });
      setTimeout(() => { if (lagWaiter === resolve) { lagWaiter = null; resolve(0); } }, 300);
    });
  }

  let current = null, playToken = 0;
  /** بيشغّل مقطع، وبيرجّع promise بتخلص لما يخلص الصوت كله (مع التأتأة اللي انضافت). */
  async function play(id) {
    stop();
    const my = ++playToken;
    const a = audioFor(id);
    const fx = await ensureFx();
    if (my !== playToken) return;
    if (fx) {
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
      if (!sources.has(a)) {
        const src = ctx.createMediaElementSource(a);
        src.connect(node);
        sources.set(a, src);
      }
    }
    current = a;
    a.currentTime = 0;
    await new Promise(resolve => {
      const done = () => { a.removeEventListener('ended', done); a.removeEventListener('pause', done); resolve(); };
      a.addEventListener('ended', done);
      a.addEventListener('pause', done);
      a.play().catch(done);
    });
    // التسجيل خلص، بس التأتأة مدّت الصوت: بنستنى لحد ما يطلع كله
    if (fx && my === playToken) {
      for (let i = 0; i < 40 && my === playToken; i++) {
        const lag = await pendingLag();
        if (!inEvent && lag <= 0.2) break;
        await new Promise(r => setTimeout(r, Math.min(400, Math.max(60, (lag - 0.12) * 1000))));
      }
    }
  }

  function stop() {
    playToken++;
    if (current) { current.pause(); current = null; }
    if (node) node.port.postMessage({ reset: true });   // سكوت فوري
    inEvent = false;
  }

  return {
    segments, load, has, duration, url, prepare, play, stop,
    isInEvent: () => inEvent,
    setEventListener: fn => { onEvent = fn; }
  };
})();
