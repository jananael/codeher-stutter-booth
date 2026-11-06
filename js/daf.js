/*
 * المحطة الأولى: «جرّب تحكي». وضعين:
 *   - محاكاة تأتأة: تكرار ومدّ ووقفات على صوت الزائر (js/stutter-worklet.js)
 *   - تأخير الصوت (Delayed Auditory Feedback)
 *
 *   المايك ─┬─► analyserIn                                   (موجة «صوتك»)
 *           ├─► تأخير ──────► pathDelay ──┐
 *           └─► محاكاة ─────► pathStutter ┴─► تكبير ─► limiter ─┬─► السماعات
 *                                                               └─► analyserOut (موجة «اللي بتسمعه»)
 * بنبدّل بين الوضعين بفتح/سكّر pathDelay و pathStutter، بدون ما نوقف المايك.
 */
window.DAF = (function () {
  const T = window.CONTENT.daf;
  const REFLECT_AFTER_MS = 12000;
  // الصوت المتأخر لازم يكون أعلى من صوتك الطبيعي اللي بتسمعه من راسك، وإلا التأخير ما بيأثر
  const GAIN = 2.2;
  // غيّروا الرقم كل ما تعدّلوا stutter-worklet.js، عشان المتصفح ما يستعمل نسخة قديمة
  const WORKLET_VERSION = 5;

  const el = {};
  let sentenceIndex = 0;
  const defaultDelay = (T.delays.find(d => d.isDefault) || T.delays[0]).value;
  let delayMs = defaultDelay;

  // حالة الصوت
  let stream = null, ctx = null, delayNode = null;
  let analyserIn = null, analyserOut = null, bufIn = null, bufOut = null;
  let running = false;
  let session = 0;           // بيزيد مع كل تشغيل/إيقاف عشان نلغي أي طلب مايك قديم
  let rafId = 0, reflectTimer = 0;
  let compareMode = false;   // «قارن حالك» شغّال: المايك تحت تحكّمه هو
  const OPT = Object.assign({ delayMode: true, compare: true }, T.options);
  const defaultMode = OPT.delayMode ? (T.modes.find(m => m.isDefault) || T.modes[0]).id : 'stutter';
  const defaultLevel = (T.intensities.find(x => x.isDefault) || T.intensities[0]).value;
  let mode = defaultMode, level = defaultLevel;
  let stutterNode = null, pathDelay = null, pathStutter = null;

  function init() {
    ['dafTitle', 'dafIntro', 'dafSteps', 'dafWarning', 'dafReadLabel', 'dafSentence',
     'dafWaveIn', 'dafWaveOut', 'dafWaveInLabel', 'dafWaveOutLabel', 'dafDelayMs', 'dafDelayDesc',
     'dafToggle', 'dafNext', 'dafDelayLabel', 'dafDelays', 'dafStatus',
     'dafReflection', 'dafReflectQ', 'dafReflectOptions', 'dafReflectMsg',
     'dafModeLabel', 'dafModes', 'dafIntensityRow', 'dafIntensityLabel', 'dafIntensity', 'dafDelayRow', 'dafModeNote']
      .forEach(id => { el[id] = document.getElementById(id); });

    el.dafTitle.textContent = T.title;
    el.dafIntro.textContent = T.intro;
    el.dafWarning.textContent = T.warning;
    el.dafReadLabel.textContent = T.readLabel;
    el.dafWaveInLabel.textContent = T.waveIn;
    el.dafWaveOutLabel.textContent = T.waveOut;
    el.dafNext.textContent = T.nextSentence;
    el.dafDelayLabel.textContent = T.delayLabel;
    el.dafDelays.setAttribute('aria-label', T.delayLabel);
    el.dafReflectQ.textContent = T.reflection.question;
    el.dafReflectMsg.textContent = T.reflection.message;
    el.dafModeLabel.textContent = T.modeLabel;
    el.dafModes.setAttribute('aria-label', T.modeLabel);
    el.dafIntensityLabel.textContent = T.intensityLabel;
    el.dafIntensity.setAttribute('aria-label', T.intensityLabel);

    T.modes.forEach(m => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = m.label;
      b.dataset.mode = m.id;
      b.addEventListener('click', () => setMode(m.id));
      el.dafModes.appendChild(b);
    });
    T.intensities.forEach(x => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = x.label;
      b.dataset.value = x.value;
      b.addEventListener('click', () => setLevel(x.value));
      el.dafIntensity.appendChild(b);
    });

    T.steps.forEach((text, i) => {
      const li = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'steps__num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = window.toArabicDigits(i + 1);
      li.append(num, document.createTextNode(text));
      el.dafSteps.appendChild(li);
    });
    el.stepItems = [...el.dafSteps.children];

    T.delays.forEach(d => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = d.label;
      b.dataset.value = d.value;
      b.setAttribute('aria-pressed', String(d.value === delayMs));
      b.addEventListener('click', () => setDelay(d.value));
      el.dafDelays.appendChild(b);
    });

    T.reflection.options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'reflection__opt';
      b.textContent = o.label;
      b.dataset.id = o.id;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => answerReflection(o.id));
      el.dafReflectOptions.appendChild(b);
    });

    // is-on = شغّال أو بيستنى إذن المايك
    el.dafToggle.addEventListener('click', () => (el.dafToggle.classList.contains('is-on') ? stop(true) : start()));
    el.dafNext.addEventListener('click', nextSentence);
    window.addEventListener('resize', () => { if (!running) drawFlat(); });
    Compare.init();

    // محاكاة بس؟ بنخفي اختيار نوع التجربة و«قارن حالك»
    if (!OPT.delayMode) el.dafModes.closest('.daf__delay').hidden = true;
    if (!OPT.compare) document.getElementById('cmpOpen').hidden = true;

    reset();
  }

  /* ---------- الصوت ---------- */
  async function start() {
    const my = ++session;
    if (!compareMode) {
      hideReflection();
      setStatus(T.status.requesting);
      el.dafToggle.textContent = T.stop;
      el.dafToggle.classList.add('is-on');
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no-media');
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,   // مهم: وإلا المتصفح بيلغي الصوت الراجع
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      // الزائر طلع من الشاشة أو وقّف قبل ما يوصل الإذن
      if (my !== session) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;

      ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
      if (ctx.state === 'suspended') await ctx.resume();
      if (my !== session) { teardown(); return; }

      const source = ctx.createMediaStreamSource(stream);

      analyserIn = ctx.createAnalyser();
      analyserIn.fftSize = 1024;
      source.connect(analyserIn);

      delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.value = delayMs / 1000;
      const gain = ctx.createGain();
      gain.gain.value = GAIN;
      // limiter: بيمنع أي صوت عالي فجأة يوصل للسماعات
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -3;      // بس بيقصّ القمم العالية، ما بيوطّي الصوت العادي
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.2;
      analyserOut = ctx.createAnalyser();
      analyserOut.fftSize = 1024;

      pathDelay = ctx.createGain();
      pathStutter = ctx.createGain();
      pathDelay.gain.value = 0;
      pathStutter.gain.value = 0;
      source.connect(delayNode);
      delayNode.connect(pathDelay);

      // المحاكاة (لو المتصفح بيدعم AudioWorklet)
      stutterNode = null;
      if (ctx.audioWorklet && window.AudioWorkletNode) {
        try {
          await ctx.audioWorklet.addModule('js/stutter-worklet.js?v=' + WORKLET_VERSION);
          if (my !== session) { teardown(); return; }
          stutterNode = new AudioWorkletNode(ctx, 'stutter-processor', {
            numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1],
            channelCount: 1, channelCountMode: 'explicit'
          });
          stutterNode.port.postMessage({ level });
          source.connect(stutterNode);
          stutterNode.connect(pathStutter);
        } catch (e) { stutterNode = null; }
      }
      if (!ctx) return;

      pathDelay.connect(gain);
      pathStutter.connect(gain);
      gain.connect(limiter);
      limiter.connect(ctx.destination);
      limiter.connect(analyserOut);

      bufIn = new Uint8Array(analyserIn.fftSize);
      bufOut = new Uint8Array(analyserOut.fftSize);

      // لو انفصل المايك/السماعة أثناء التشغيل
      stream.getAudioTracks().forEach(t => t.addEventListener('ended', () => {
        if (my === session) { stop(false); setStatus(T.status.error, true); }
      }));

      running = true;
      routeAudio();
      if (!compareMode) {
        window.Stats.inc('voice');
        setStep('running');
        setStatus(runningText());
        reflectTimer = setTimeout(showReflection, REFLECT_AFTER_MS);
      }
      loop();
    } catch (err) {
      if (my !== session) return;
      teardown();
      if (compareMode) { Compare.micError(); return; }
      resetToggle();
      setStep('idle');
      setStatus(T.status.error, true);
    }
  }

  /** userInitiated: الزائر ضغط «إيقاف» (بنعرض سؤال التأمّل). */
  function stop(userInitiated) {
    const wasActive = running;
    session++;
    teardown();
    resetToggle();
    if (userInitiated) {
      setStatus(T.status.stopped);
      setStep(wasActive ? 'stopped' : 'idle');
      if (wasActive) showReflection();
    }
  }

  /** بتسكّر المايك والـ AudioContext تماماً. */
  function teardown() {
    running = false;
    cancelAnimationFrame(rafId);
    clearTimeout(reflectTimer);
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    if (ctx) { ctx.close().catch(() => {}); ctx = null; }
    delayNode = analyserIn = analyserOut = bufIn = bufOut = null;
    stutterNode = pathDelay = pathStutter = null;
    drawFlat();
  }

  function setDelay(ms) {
    delayMs = ms;
    el.dafDelays.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(Number(b.dataset.value) === ms)));
    updateBadge();
    if (ctx && delayNode) {
      delayNode.delayTime.setTargetAtTime(ms / 1000, ctx.currentTime, 0.02);
    }
    if (running && !compareMode) setStatus(runningText());
  }

  /* ---------- الوضع: محاكاة أو تأخير ---------- */
  function setMode(id) {
    mode = id;
    el.dafModes.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.mode === id)));
    el.dafIntensityRow.hidden = id !== 'stutter';
    el.dafDelayRow.hidden = id !== 'delay';
    el.dafModeNote.textContent = id === 'stutter' ? T.simNote : T.delayNote;
    el.dafModeNote.classList.remove('is-error');
    updateBadge();
    routeAudio();
    if (running && !compareMode) setStatus(runningText());
  }

  function setLevel(v) {
    level = v;
    el.dafIntensity.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(Number(b.dataset.value) === v)));
    if (stutterNode) stutterNode.port.postMessage({ level: v });
    updateBadge();
  }

  function updateBadge() {
    if (mode === 'stutter') {
      el.dafDelayMs.textContent = T.stutterBadge;
      el.dafDelayDesc.textContent = (T.intensities.find(x => x.value === level) || T.intensities[0]).label;
    } else {
      const d = T.delays.find(x => x.value === delayMs) || T.delays[0];
      el.dafDelayMs.textContent = d.badge;
      el.dafDelayDesc.textContent = d.desc;
    }
  }

  /** بيفتح المسار الصح (محاكاة أو تأخير) بدون طقطقة. */
  function routeAudio() {
    if (!ctx || !pathDelay) return;
    if (mode === 'stutter' && !stutterNode) {        // المتصفح ما بيدعم المحاكاة
      setMode('delay');
      el.dafModeNote.textContent = T.stutterUnavailable;
      el.dafModeNote.classList.add('is-error');
      return;
    }
    const st = mode === 'stutter';
    pathStutter.gain.setTargetAtTime(st ? 1 : 0, ctx.currentTime, 0.02);
    pathDelay.gain.setTargetAtTime(st ? 0 : 1, ctx.currentTime, 0.02);
  }

  /**
   * بيضوّي الخطوة اللي لازم الزائر يعملها هلأ، وبيعلّم اللي قبلها كمخلّصة.
   * idle: «ابدأ» (الخطوة ٣)، running: «اقرأ» (٤)، stopped: «جاوب» (٥)
   */
  function setStep(state) {
    if (!el.stepItems) return;
    const n = el.stepItems.length;
    const current = state === 'running' ? n - 2 : state === 'stopped' ? n - 1 : n - 3;
    el.stepItems.forEach((li, i) => {
      li.classList.toggle('is-current', i === current);
      li.classList.toggle('is-done', state !== 'idle' && i < current);
      if (i === current) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
  }

  function runningText() {
    if (mode === 'stutter') return T.status.runningStutter;
    return delayMs === 0 ? T.status.runningNoDelay : T.status.running;
  }

  function nextSentence() {
    sentenceIndex = (sentenceIndex + 1) % T.sentences.length;
    el.dafSentence.textContent = T.sentences[sentenceIndex];
    if (!running) hideReflection();
  }

  /* ---------- الرسم ---------- */
  function sizeCanvas(c) {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(c.clientWidth * dpr));
    const h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return { g: c.getContext('2d'), w, h, dpr };
  }

  function drawLine(canvas, values, color) {
    const { g, w, h, dpr } = sizeCanvas(canvas);
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#F1D3E2';
    g.lineWidth = 1 * dpr;
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();

    if (!values) return;
    g.strokeStyle = color;
    g.lineWidth = 3 * dpr;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    // توهّج خفيف
    g.shadowColor = color === '#FF0092' ? 'rgba(255,0,146,.35)' : 'rgba(10,29,44,.2)';
    g.shadowBlur = 8 * dpr;
    g.beginPath();
    const n = values.length;
    const pad = 8 * dpr;
    for (let i = 0; i < n; i++) {
      const x = pad + (i / (n - 1)) * (w - pad * 2);
      const v = (values[i] - 128) / 128;          // -1..1
      const y = h / 2 + Math.max(-1, Math.min(1, v * 1.8)) * (h / 2 - pad);
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    g.shadowBlur = 0;
  }

  function drawFlat() {
    if (!el.dafWaveIn) return;
    drawLine(el.dafWaveIn, null);
    drawLine(el.dafWaveOut, null);
  }

  function loop() {
    if (!running || !analyserIn) return;
    analyserIn.getByteTimeDomainData(bufIn);
    analyserOut.getByteTimeDomainData(bufOut);
    drawLine(el.dafWaveIn, bufIn, '#0A1D2C');
    drawLine(el.dafWaveOut, bufOut, '#FF0092');
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- التأمّل ---------- */
  function showReflection() {
    if (!el.dafReflection.hidden) return;
    el.dafReflectMsg.textContent = mode === 'stutter' ? T.reflection.messageStutter : T.reflection.message;
    el.dafReflection.hidden = false;
    window.App.stationDone('daf');
    el.dafReflection.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function hideReflection() {
    el.dafReflection.hidden = true;
    el.dafReflectMsg.hidden = true;
    el.dafReflectOptions.querySelectorAll('button').forEach(b => {
      b.disabled = false;
      b.setAttribute('aria-pressed', 'false');
    });
  }
  function answerReflection(id) {
    el.dafReflectOptions.querySelectorAll('button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.id === id));
      b.disabled = true;
    });
    el.dafReflectMsg.hidden = false;
    window.Stats.incFeeling(id);
  }

  /* ---------- واجهة ---------- */
  function setStatus(text, isError) {
    el.dafStatus.textContent = text;
    el.dafStatus.classList.toggle('is-error', !!isError);
  }
  function resetToggle() {
    el.dafToggle.textContent = T.start;
    el.dafToggle.classList.remove('is-on');
  }

  /** رجوع للحالة الأولى (بيوقف المايك كمان). */
  function reset() {
    Compare.close();
    stop(false);
    sentenceIndex = 0;
    el.dafSentence.textContent = T.sentences[0];
    hideReflection();
    setStatus(T.status.idle);
    setDelay(defaultDelay);
    setLevel(defaultLevel);
    setMode(defaultMode);
    setStep('idle');
  }

  /* ---------- «قارن حالك» ----------
   * نفس الجملة مرتين (بدون تأخير، ومع تأخير). بنقيس من الإشارة الأصلية (analyserIn):
   * متى بلّش الحكي، متى خلص، وكم وقفة أطول من ٣٠٠ مللي ث. ما في أي تسجيل.
   */
  const Compare = (function () {
    const K = T.compare;
    const SAMPLE_MS = 30, CALIBRATE_MS = 700, END_SILENCE_MS = 2000, MAX_MS = 30000;
    const PAUSE_MS = 300, MIN_SPEECH_MS = 500;
    const c = {};
    let step = 0, results = [], phase = 'idle', sampler = 0, userDelay = defaultDelay, userMode = defaultMode;
    let frames = [], noise = [], t0 = 0, lastSpeech = 0, threshold = 0.02, floatBuf = null;
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmtSec = ms => window.toArabicDigits((ms / 1000).toFixed(1)).replace('.', window.LANG === 'ar' ? '٫' : '.');

    function init() {
      ['cmpOpen', 'cmpPanel', 'cmpTitle', 'cmpStep', 'cmpRun', 'cmpIntro', 'cmpMode', 'cmpLevel', 'cmpStatus',
       'cmpGo', 'cmpCancel', 'cmpResult', 'cmpColNone', 'cmpColDelay', 'cmpRowTime', 'cmpRowPauses',
       'cmpT0', 'cmpT1', 'cmpP0', 'cmpP1', 'cmpVerdict', 'cmpMsg', 'cmpNote', 'cmpAgain', 'cmpClose']
        .forEach(id => { c[id] = document.getElementById(id); });
      c.cmpOpen.textContent = K.open;
      c.cmpTitle.textContent = K.title;
      c.cmpIntro.textContent = K.intro;
      c.cmpCancel.textContent = K.cancel;
      c.cmpColNone.textContent = K.colNone;
      c.cmpColDelay.textContent = K.colDelay;
      c.cmpRowTime.textContent = K.rowTime;
      c.cmpRowPauses.textContent = K.rowPauses;
      c.cmpMsg.textContent = K.message;
      c.cmpNote.textContent = K.note;
      c.cmpAgain.textContent = K.again;
      c.cmpClose.textContent = K.close;

      c.cmpOpen.addEventListener('click', open);
      c.cmpGo.addEventListener('click', () => (phase === 'listening' ? finish() : begin()));
      c.cmpCancel.addEventListener('click', close);
      c.cmpClose.addEventListener('click', close);
      c.cmpAgain.addEventListener('click', () => { results = []; step = 0; showRun(); });
    }

    function lock(on) {
      el.dafToggle.disabled = on;
      el.dafNext.disabled = on;
      [el.dafDelays, el.dafModes, el.dafIntensity].forEach(g =>
        g.querySelectorAll('button').forEach(b => { b.disabled = on; }));
    }

    function open() {
      if (running || el.dafToggle.classList.contains('is-on')) stop(false);
      compareMode = true;
      userDelay = delayMs;
      userMode = mode;
      setMode('delay');
      hideReflection();
      setStatus('');
      lock(true);
      c.cmpOpen.hidden = true;
      c.cmpPanel.hidden = false;
      results = [];
      step = 0;
      showRun();
      c.cmpPanel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    }

    function showRun() {
      phase = 'idle';
      c.cmpRun.hidden = false;
      c.cmpResult.hidden = true;
      c.cmpStep.textContent = K.step.replace('{n}', window.toArabicDigits(step + 1)).replace('{total}', window.toArabicDigits(K.steps.length));
      c.cmpIntro.hidden = step !== 0;
      c.cmpMode.textContent = K.steps[step].label;
      c.cmpGo.textContent = K.startReading;
      c.cmpGo.disabled = false;
      c.cmpGo.classList.remove('is-on');
      setCmpStatus('');
      setLevel(0);
    }

    function setCmpStatus(text, isError) {
      c.cmpStatus.textContent = text;
      c.cmpStatus.classList.toggle('is-error', !!isError);
    }
    function setLevel(v) { c.cmpLevel.style.transform = 'scaleX(' + Math.max(0, Math.min(1, v)) + ')'; }

    function rms() {
      if (!analyserIn) return 0;
      if (!floatBuf || floatBuf.length !== analyserIn.fftSize) floatBuf = new Float32Array(analyserIn.fftSize);
      analyserIn.getFloatTimeDomainData(floatBuf);
      let sum = 0;
      for (let i = 0; i < floatBuf.length; i++) sum += floatBuf[i] * floatBuf[i];
      return Math.sqrt(sum / floatBuf.length);
    }

    async function begin() {
      if (phase !== 'idle') return;
      phase = 'starting';
      c.cmpGo.disabled = true;
      setCmpStatus('');
      setDelay(K.steps[step].delay);
      if (!running) await start();
      if (!compareMode || !running) return;   // انلغى، أو صار خطأ مايك (micError بيرتّب الواجهة)

      // معايرة: لحظة سكوت عشان نعرف مستوى الضجة بالبوث
      phase = 'calibrating';
      setCmpStatus(K.calibrating);
      noise = [];
      frames = [];
      t0 = performance.now();
      lastSpeech = 0;
      clearInterval(sampler);
      sampler = setInterval(tick, SAMPLE_MS);
    }

    function tick() {
      const now = performance.now() - t0;
      const v = rms();
      if (phase === 'calibrating') {
        noise.push(v);
        setLevel(v * 8);
        if (now >= CALIBRATE_MS) {
          const sorted = noise.slice().sort((x, y) => x - y);
          const floor = sorted[Math.floor(sorted.length / 2)] || 0;
          threshold = Math.min(0.15, Math.max(0.012, floor * 3 + 0.008));
          phase = 'listening';
          t0 = performance.now();
          setCmpStatus(K.listening);
          c.cmpGo.textContent = K.done;
          c.cmpGo.disabled = false;
          c.cmpGo.classList.add('is-on');
        }
        return;
      }
      if (phase !== 'listening') return;
      frames.push({ t: now, v });
      setLevel(v / (threshold * 4));
      if (v > threshold) lastSpeech = now;
      // بتخلص لحالها: سكوت ثانيتين بعد ما حكى، أو ٣٠ ثانية
      if ((lastSpeech > 0 && now - lastSpeech > END_SILENCE_MS && speechMs() >= MIN_SPEECH_MS) || now > MAX_MS) finish();
    }

    function speechMs() {
      let n = 0;
      for (const f of frames) if (f.v > threshold) n++;
      return n * SAMPLE_MS;
    }

    /** بيرجّع {duration, pauses} أو null إذا ما في كلام واضح. */
    function analyze() {
      const speech = frames.map(f => f.v > threshold);
      const first = speech.indexOf(true);
      const last = speech.lastIndexOf(true);
      if (first < 0 || speechMs() < MIN_SPEECH_MS) return null;
      let pauses = 0, gapStart = -1;
      for (let i = first; i <= last; i++) {
        if (!speech[i] && gapStart < 0) gapStart = i;
        if (speech[i] && gapStart >= 0) {
          if (frames[i].t - frames[gapStart].t >= PAUSE_MS) pauses++;
          gapStart = -1;
        }
      }
      return { duration: frames[last].t - frames[first].t + SAMPLE_MS, pauses };
    }

    function finish() {
      if (phase !== 'listening') return;
      clearInterval(sampler);
      phase = 'idle';
      setLevel(0);
      c.cmpGo.classList.remove('is-on');
      const r = analyze();
      if (!r) {
        c.cmpGo.textContent = K.startReading;
        setCmpStatus(K.noSpeech, true);
        return;
      }
      results[step] = r;
      step++;
      if (step < K.steps.length) { showRun(); return; }
      showResult();
    }

    function showResult() {
      session++;
      teardown();                       // المايك بيتسكّر قبل ما نعرض النتيجة
      const a = results[0], b = results[1];
      c.cmpT0.textContent = K.seconds.replace('{s}', fmtSec(a.duration));
      c.cmpT1.textContent = K.seconds.replace('{s}', fmtSec(b.duration));
      c.cmpP0.textContent = window.toArabicDigits(a.pauses);
      c.cmpP1.textContent = window.toArabicDigits(b.pauses);
      const pct = Math.round((b.duration - a.duration) / a.duration * 100);
      c.cmpVerdict.textContent = Math.abs(pct) < 8 ? K.same
        : (pct > 0 ? K.slower : K.faster).replace('{p}', window.toArabicDigits(Math.abs(pct)));
      c.cmpVerdict.classList.toggle('is-slower', pct >= 8);
      c.cmpRun.hidden = true;
      c.cmpResult.hidden = false;
      c.cmpStep.textContent = K.resultTitle;
      window.Stats.inc('compare');
      window.App.stationDone('daf');
      c.cmpAgain.focus({ preventScroll: true });
      c.cmpPanel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    }

    function micError() {
      phase = 'idle';
      c.cmpGo.disabled = false;
      c.cmpGo.textContent = K.startReading;
      setCmpStatus(T.status.error, true);
    }

    /** بيسكّر «قارن حالك» وبيرجّع المحطة لوضعها العادي. */
    function close() {
      if (!compareMode) return;
      clearInterval(sampler);
      phase = 'idle';
      compareMode = false;
      if (running) { session++; teardown(); }
      lock(false);
      setDelay(userDelay);
      setMode(userMode);
      c.cmpPanel.hidden = true;
      c.cmpOpen.hidden = false;
      setStatus(T.status.idle);
    }

    return { init, close, micError };
  })();

  return { init, stop: () => { Compare.close(); stop(false); }, reset, onShow };

  /** كل دخول للمحطة بيبدأ من الأول (الخطوات وسؤال التأمّل). */
  function onShow() {
    if (!running) {
      hideReflection();
      setStep('idle');
      setStatus(T.status.idle);
    }
    requestAnimationFrame(drawFlat);
  }

})();
