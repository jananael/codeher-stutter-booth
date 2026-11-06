/*
 * محاكاة تأتأة على صوت الزائر، مباشرة (AudioWorklet).
 *
 * الصوت بيمرّ بتأخير صغير ثابت (~١٢٠ مللي ث)، عشان نلحق نشوف بداية الكلمة قبل ما تنسمع.
 * لما الزائر يبلّش كلمة بعد سكوت (أو أحياناً بنص الكلام)، ممكن يصير «حدث»:
 *   - تكرار: أول مقطع من الكلمة بيتكرر (بـ.. بـ.. بدّي)
 *   - مدّ:    أول صوت بيطوّل (ســـلام)
 *   - وقفة:  سكوت قصير قبل ما تطلع الكلمة
 * بعد الحدث الكلمة بتكمل طبيعي. الوقت اللي «تأخّر» بنعوّضه بالسكتات (بنمرق عليها أسرع).
 * ما في أي تسجيل: كل إشي بذاكرة مؤقتة دوّارة مدتها ٤ ثواني.
 */

// ١ خفيف، ٢ متوسط، ٣ قوي (المحطة ١)، ٤ قوي جداً (تسجيلات «تحدّي الصبر»)
const LEVELS = {
  1: { onset: 0.35, midPerSec: 0.10, repMin: 1, repMax: 2, cool: 0.6 },
  2: { onset: 0.65, midPerSec: 0.25, repMin: 2, repMax: 3, cool: 0.3 },
  3: { onset: 0.90, midPerSec: 0.45, repMin: 2, repMax: 4, cool: 0.12 },
  4: { onset: 1.00, midPerSec: 1.10, repMin: 3, repMax: 5, cool: 0.05 }
};

const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));

class StutterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    const sr = sampleRate;
    this.sr = sr;
    this.N = Math.round(sr * 8);                 // ذاكرة دوّارة ٨ ثواني
    this.buf = new Float32Array(this.N);
    this.BLOCK = 128;
    this.energy = new Float32Array(Math.ceil(this.N / this.BLOCK));
    this.w = 0;                                  // كم عيّنة انكتبت (مطلق)
    this.baseLag = Math.round(0.12 * sr);
    this.maxLag = Math.round(6 * sr);
    this.r = -this.baseLag;                      // وين وصلنا بالتشغيل (مطلق)
    this.floor = 0.01;
    this.thresh = 0.02;
    this.silent = sr;                            // كم عيّنة صار في سكوت
    this.level = 2;
    this.cool = 0;
    this.coolAfter = 0;
    this.pending = -1;                           // بداية كلمة بتستنى توصل للتشغيل
    this.ev = null;
    this.fadeN = Math.round(0.004 * sr);
    this.fade = this.fadeN;
    this.counts = { onsets: 0, events: 0, rep: 0, prolong: 0, block: 0 };   // للفحص بس
    this.port.onmessage = e => {
      if (e.data && LEVELS[e.data.level]) this.level = e.data.level;
      if (e.data && e.data.reset) {            // مقاطعة: سكوت فوري وننسى اللي بالذاكرة
        this.ev = null; this.pending = -1; this.r = this.w; this.fade = 0; this.cool = 0;
      }
      if (e.data && e.data.debug) this.port.postMessage(Object.assign({ lag: (this.w - this.r) / this.sr }, this.counts));
    };
  }

  at(i) {
    if (i < 0) return 0;
    return this.buf[i % this.N];
  }

  energyAt(i) {
    if (i < 0) return 0;
    return this.energy[Math.floor(i / this.BLOCK) % this.energy.length];
  }

  startEvent() {
    const sr = this.sr;
    const L = LEVELS[this.level];
    const seg = this.pending;
    this.pending = -1;
    const roll = Math.random();
    let len;
    this.counts.events++;
    this.port.postMessage({ ev: 'start' });
    if (roll < 0.6) {
      const segLen = Math.round(rand(0.08, 0.15) * sr);
      const reps = randInt(L.repMin, L.repMax);
      const gap = Math.round(rand(0.04, 0.09) * sr);
      this.counts.rep++;
      this.ev = { type: 'rep', seg, segLen, reps, gap, pos: 0, gapLeft: 0, resume: seg };
      len = (segLen + gap) * reps;
    } else if (roll < 0.8) {
      const grain = Math.round(0.04 * sr);
      const dur = Math.round(rand(0.3, 0.6) * (0.8 + 0.2 * this.level) * sr);
      const start = seg + Math.round(0.02 * sr);
      this.counts.prolong++;
      this.ev = { type: 'prolong', start, grain, dur, t: 0, resume: start + grain };
      len = dur;
    } else {
      const dur = Math.round(rand(0.25, 0.55) * sr);
      this.counts.block++;
      this.ev = { type: 'block', left: dur, resume: seg };
      len = dur;
    }
    this.coolAfter = Math.round(L.cool * sr);   // فترة الانتظار بتبلش بعد ما يخلص الحدث
  }

  endEvent() {
    this.port.postMessage({ ev: 'end' });
    this.r = this.ev.resume;
    this.ev = null;
    this.fade = 0;
    this.cool = this.coolAfter;
  }

  eventSample() {
    const ev = this.ev;
    const edge = this.fadeN;
    if (ev.type === 'rep') {
      if (ev.gapLeft > 0) {
        ev.gapLeft--;
        if (ev.gapLeft === 0 && ev.reps === 0) this.endEvent();
        return 0;
      }
      const p = ev.pos;
      const g = Math.min(1, p / edge, (ev.segLen - p) / edge);
      const v = this.at(ev.seg + p) * g;
      if (++ev.pos >= ev.segLen) {
        ev.pos = 0;
        ev.reps--;
        ev.gapLeft = ev.gap;
      }
      return v;
    }
    if (ev.type === 'prolong') {
      // overlap-add لحبّتين متداخلتين بنص الطول، بنافذة hann² (مجموعها ثابت = ١)
      const G = ev.grain, t = ev.t;
      const a = t % G, b = (t + G / 2) % G;
      const wa = Math.sin(Math.PI * a / G) ** 2, wb = Math.sin(Math.PI * b / G) ** 2;
      const env = Math.min(1, t / (edge * 3), (ev.dur - t) / (edge * 3));
      const v = (this.at(ev.start + a) * wa + this.at(ev.start + Math.floor(b)) * wb) * env;
      if (++ev.t >= ev.dur) this.endEvent();
      return v;
    }
    // block
    if (--ev.left <= 0) this.endEvent();
    return 0;
  }

  nextSample() {
    if (!this.ev && this.pending >= 0 && this.r >= this.pending) this.startEvent();
    if (this.ev) return this.eventSample();

    const lag = this.w - this.r;
    if (lag > this.maxLag) {                     // متأخرين كثير: بنقفز
      this.r = this.w - this.baseLag;
      this.fade = 0;
    } else if (lag > this.baseLag + 2 && this.energyAt(this.r) < this.thresh) {
      this.r += 3;                               // بنعوّض التأخير بالسكتات (بأربع أضعاف السرعة)
    }
    let v = this.at(this.r++);
    if (this.fade < this.fadeN) v *= this.fade++ / this.fadeN;
    return v;
  }

  process(inputs, outputs) {
    const inp = inputs[0] && inputs[0][0];
    const out = outputs[0][0];
    const n = out.length;
    const L = LEVELS[this.level];

    // ١) كتابة الصوت الجاي بالذاكرة + قياس طاقته
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const v = inp ? inp[i] : 0;
      this.buf[(this.w + i) % this.N] = v;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / n);
    this.energy[Math.floor(this.w / this.BLOCK) % this.energy.length] = rms;

    // مستوى الضجة بيتعدّل لحاله: بينزل بسرعة، وبيطلع ببطء
    this.floor = rms < this.floor ? this.floor * 0.9 + rms * 0.1 : this.floor * 1.0005;
    this.floor = Math.max(this.floor, 0.0005);
    this.thresh = Math.max(0.006, this.floor * 3.5);

    // ٢) هل في بداية كلمة؟
    // بنقدر نلقط بداية الكلمة الجاية حتى وحدث شغّال، وبتستنى دورها
    const free = this.pending < 0 && this.cool <= 0;
    if (rms > this.thresh) {
      if (this.silent > 0.15 * this.sr) this.counts.onsets++;
      if (free && this.silent > 0.15 * this.sr && Math.random() < L.onset) this.pending = this.w;
      else if (free && Math.random() < L.midPerSec * n / this.sr) this.pending = this.w;
      this.silent = 0;
    } else {
      this.silent += n;
    }
    this.w += n;

    // ٣) التشغيل
    for (let i = 0; i < n; i++) out[i] = this.nextSample();
    if (this.cool > 0 && !this.ev) this.cool -= n;
    return true;
  }
}

registerProcessor('stutter-processor', StutterProcessor);
