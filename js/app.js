/*
 * التنقل بين الشاشات + موجة الرئيسية + وضع الجذب + اللغة + الرجوع التلقائي (idle reset).
 */
(function () {
  const C = window.CONTENT;
  const IDLE_MS = 90 * 1000;          // رجوع للرئيسية وتصفير كل إشي
  const ATTRACT_MS = 15 * 1000;       // وضع الجذب على الرئيسية
  const PHRASE_MS = 4500;             // كل قديش بتتبدل عبارة الجذب
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // بالعربي: ١٢٣ بدل 123 بكل الواجهة. بالإنجليزي: الأرقام زي ما هي.
  window.toArabicDigits = window.LANG === 'ar'
    ? n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
    : n => String(n);

  let current = 'home';
  let idleTimer = 0;
  let sessionActive = false;          // جلسة = من أول محطة لحد الرجوع التلقائي أو وضع الجذب
  const STATIONS = ['daf', 'quiz', 'game'];
  const doneStations = new Set();     // المحطات اللي خلصت بهاي الجلسة
  let finaleOffered = false;

  /* ---------- الشاشات ---------- */
  const screens = {};
  document.querySelectorAll('.screen').forEach(s => { screens[s.dataset.screen] = s; });
  const homeBtn = document.getElementById('homeBtn');

  function show(name, opts) {
    opts = opts || {};
    if (!screens[name]) return;
    if (current === 'daf' && name !== 'daf') window.DAF.stop();
    if (name === 'quiz') window.Quiz.reset();     // كل دخول للكويز من أول سؤال
    if (name === 'game') window.Game.reset();     // واللعبة من شاشة البداية
    else if (current === 'game') window.Game.stop();
    // (النتيجة بتنعرض من جوّا الكويز، فما بنصفّر هناك)

    if (name !== 'home' && !sessionActive) {
      sessionActive = true;
      window.Stats.inc('sessions');
    }

    Object.entries(screens).forEach(([key, s]) => {
      const on = key === name;
      s.hidden = !on;
      s.classList.toggle('is-active', on);
    });
    current = name;
    homeBtn.hidden = name === 'home';
    window.scrollTo(0, 0);

    if (name === 'finale') { finaleBar.hidden = true; renderFinale(); }
    if (name === 'home') { HomeWave.start(); Attract.schedule(); }
    else { HomeWave.stop(); Attract.exit(); Attract.cancel(); }
    if (name === 'daf') window.DAF.onShow();

    if (!opts.silent) {
      const heading = screens[name].querySelector('[tabindex="-1"]');
      if (heading) heading.focus({ preventScroll: true });
    }
    if (name === 'result') { stationDone('quiz'); celebrate(document.getElementById('resultScore')); }
    if (name === 'finale') celebrate(document.getElementById('finaleStations'));
  }

  /* ---------- محطات الجلسة + شاشة النهاية ---------- */
  const finaleBar = document.getElementById('finaleBar');

  function stationDone(name) {
    if (!sessionActive || doneStations.has(name)) return;
    doneStations.add(name);
    if (!finaleOffered && STATIONS.every(st => doneStations.has(st))) {
      finaleOffered = true;
      window.Stats.inc('complete3');
      finaleBar.hidden = false;           // دعوة، مش إجبار: بيقدر يكمّل وين ما بده
    }
  }

  function clearSession() {
    sessionActive = false;
    doneStations.clear();
    finaleOffered = false;
    finaleBar.hidden = true;
  }

  function renderFinale() {
    document.getElementById('finaleStations').textContent = C.finale.stations
      .replace('{n}', window.toArabicDigits(doneStations.size))
      .replace('{total}', window.toArabicDigits(STATIONS.length));
  }

  /** «ابدأ تجربة جديدة»: صفحة بيضا للزائر الجاي. */
  function newExperience() {
    window.DAF.reset();
    window.Quiz.reset();
    window.Game.reset();
    clearSession();
    show('home');
  }

  /** احتفال صغير (نقاط زهرية بتطير) حوالين عنصر. */
  function celebrate(target) {
    if (!target || reducedMotion.matches) return;
    const box = document.createElement('span');
    box.className = 'burst';
    box.setAttribute('aria-hidden', 'true');
    const n = 14;
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('i');
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const d = 70 + Math.random() * 70;
      dot.style.setProperty('--x', Math.cos(a) * d + 'px');
      dot.style.setProperty('--y', Math.sin(a) * d + 'px');
      dot.style.animationDelay = Math.random() * 120 + 'ms';
      if (i % 3 === 0) dot.className = 'is-navy';
      box.appendChild(dot);
    }
    target.style.position = 'relative';
    target.appendChild(box);
    setTimeout(() => box.remove(), 1400);
  }

  window.App = { stationDone, celebrate };

  /* ---------- النصوص الثابتة ---------- */
  function renderStatic() {
    document.getElementById('occasion').textContent = C.header.occasion;
    document.getElementById('logo').alt = C.header.logoAlt;
    homeBtn.textContent = C.header.home;
    document.getElementById('homeTitleHighlight').textContent = C.home.titleHighlight;
    document.getElementById('homeTitleRest').textContent = C.home.titleRest;
    document.getElementById('homeSubtitle').textContent = C.home.subtitle;
    document.getElementById('attractCta').textContent = C.attract.cta;

    const cards = document.getElementById('homeCards');
    C.home.cards.forEach(card => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card card--link';
      b.innerHTML = '<span class="card__tag"></span><span class="card__title"></span>' +
                    '<span class="card__desc"></span><span class="card__go" aria-hidden="true"></span>';
      b.querySelector('.card__tag').textContent = card.tag;
      b.querySelector('.card__title').textContent = card.title;
      b.querySelector('.card__desc').textContent = card.desc;
      b.querySelector('.card__go').textContent = C.home.go;
      b.addEventListener('click', () => show(card.target));
      cards.appendChild(b);
    });

    // شاشة النهاية
    document.getElementById('finaleKicker').textContent = C.finale.kicker;
    document.getElementById('finaleTitle').textContent = C.finale.title;
    document.getElementById('finaleMessage').textContent = C.finale.message;
    document.getElementById('finaleRestart').textContent = C.finale.restart;
    document.getElementById('finaleBarText').textContent = C.finale.bar;
    document.getElementById('finaleBarBtn').textContent = C.finale.barButton;

    // QR: بيبين بس إذا الصورة assets/tips-qr.png موجودة (منفحصها مرة وحدة)
    const figs = document.querySelectorAll('.qr');
    figs.forEach(fig => {
      fig.querySelector('img').alt = C.qr.alt;
      fig.querySelector('figcaption').textContent = C.qr.caption;
    });
    const probe = new Image();
    probe.onload = () => figs.forEach(fig => {
      fig.querySelector('img').src = probe.src;
      fig.hidden = false;
    });
    probe.src = 'assets/tips-qr.png';

    // زر اللغة
    const sw = document.getElementById('langSwitch');
    sw.setAttribute('aria-label', C.header.langLabel);
    sw.querySelectorAll('button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === window.LANG));
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
  }

  /** تغيير اللغة: بنحفظها وبنعيد تحميل الصفحة عشان كل الشاشات تنبني من جديد. */
  function setLang(lang) {
    if (lang === window.LANG) return;
    window.DAF.stop();
    try { localStorage.setItem('booth-lang', lang); } catch (e) { /* بدون تخزين ما بتنحفظ */ }
    location.reload();
  }

  /* ---------- الرجوع التلقائي للرئيسية ---------- */
  function resetToHome() {
    window.DAF.reset();
    window.Quiz.reset();
    window.Game.reset();
    window.Stats.close();
    clearSession();
    // الزائر الجاي بيبدأ بالعربي
    if (window.LANG !== 'ar') { setLang('ar'); return; }
    show('home', { silent: true });
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  }
  function bumpIdle(e) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(resetToHome, IDLE_MS);
    if (Attract.isOn()) Attract.exit(e && (e.type === 'pointerdown' || e.type === 'touchstart'));
    if (current === 'home') Attract.schedule();
  }

  /* ---------- وضع الجذب ----------
   * بعد ١٥ ثانية بدون لمس على الرئيسية: عبارات قصيرة بتظهر وبتختفي،
   * الموجة بتتفاعل معها، وزر كبير «جاهز تجرّب؟». أي لمسة بترجّع الوضع العادي.
   */
  const Attract = (function () {
    const home = document.getElementById('home');
    const phraseEl = document.getElementById('attractPhrase');
    const cta = document.getElementById('attractCta');
    const phrases = C.attract.phrases;
    let timer = 0, rotateTimer = 0, swapTimer = 0, on = false, idx = 0;

    function schedule() {
      clearTimeout(timer);
      if (!on) timer = setTimeout(enter, ATTRACT_MS);
    }
    function cancel() { clearTimeout(timer); }

    function enter() {
      if (current !== 'home' || window.Stats.isOpen()) return;
      on = true;
      clearSession();                     // ما حدا واقف: الجلسة خلصت
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      home.classList.add('is-attract');
      phraseEl.hidden = false;
      cta.hidden = false;
      idx = Math.floor(Math.random() * phrases.length);
      showPhrase();
      rotateTimer = setInterval(nextPhrase, PHRASE_MS);
    }

    function showPhrase() {
      phraseEl.textContent = phrases[idx];
      phraseEl.classList.add('is-in');
      HomeWave.pulse();
    }
    function nextPhrase() {
      idx = (idx + 1) % phrases.length;
      if (reducedMotion.matches) { showPhrase(); return; }
      phraseEl.classList.remove('is-in');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(showPhrase, 450);
    }

    /** swallowClick: اللمسة اللي طلّعت من وضع الجذب ما لازم تفتح كرت بالغلط. */
    function exit(swallowClick) {
      if (!on) return;
      on = false;
      clearInterval(rotateTimer);
      clearTimeout(swapTimer);
      home.classList.remove('is-attract');
      phraseEl.classList.remove('is-in');
      phraseEl.hidden = true;
      cta.hidden = true;
      if (swallowClick) {
        const block = ev => { ev.stopPropagation(); ev.preventDefault(); };
        window.addEventListener('click', block, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', block, { capture: true }), 600);
      }
    }

    cta.addEventListener('click', () => exit(false));
    return { schedule, cancel, exit, isOn: () => on };
  })();

  /* ---------- موجة الرئيسية ----------
   * خط ناعم بينساب، وكل كم ثانية بجزء منه بتصير «تعليقة» قصيرة
   * (نبضات صغيرة متكررة) وبعدين بيرجع ينساب. بوضع الجذب بتكبر مع كل عبارة.
   */
  const HomeWave = (function () {
    const canvas = document.getElementById('homeWave');
    const g = canvas.getContext('2d');
    const CYCLE = 5200;      // كل قديش بتصير تعليقة (ms)
    const STUTTER = 1300;    // مدة التعليقة (ms)
    let raf = 0, t0 = 0, active = false;
    let center = 0.62, nextCenter = 0.38;
    let pulseAt = -1e9;      // آخر مرة الموجة «انتبهت» لعبارة جديدة

    function size() {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      return { w, h, dpr };
    }

    // y في المدى -1..1 لنقطة x (0..1) بوقت t (ثواني)
    function sample(x, t, stutterAmt, phase, c) {
      const edge = Math.sin(Math.PI * x);                     // يتلاشى عالأطراف
      let y = 0.52 * Math.sin(2 * Math.PI * (x * 1.6) + t * 0.9 + phase)
            + 0.28 * Math.sin(2 * Math.PI * (x * 3.3) - t * 1.3 + phase * 2)
            + 0.12 * Math.sin(2 * Math.PI * (x * 6.1) + t * 0.6);
      y *= edge * edge;

      if (stutterAmt > 0) {
        const d = (x - c) / 0.045;
        const local = Math.exp(-d * d);
        // نبضات متكررة بالمكان نفسه، زي مقطع بيتكرر
        y = y * (1 - 0.55 * local * stutterAmt)
          + local * stutterAmt * 0.55 * Math.sin(2 * Math.PI * x * 70);
      }
      return y;
    }

    function stutterAt(ms) {
      const p = (ms % CYCLE) / STUTTER;
      if (p >= 1) return 0;
      const env = Math.sin(Math.PI * p);                       // دخول وخروج ناعم
      const pulses = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 3 * p)), 2); // ٣ نبضات
      return env * (0.35 + 0.65 * pulses);
    }

    function draw(ms, now) {
      const { w, h, dpr } = size();
      const t = ms / 1000;
      const cycle = Math.floor(ms / CYCLE);
      // مكان التعليقة بيتنقل بين دورة ودورة
      const c = cycle % 2 ? nextCenter : center;
      const s = stutterAt(ms);
      // نبضة ناعمة لما تطلع عبارة جذب جديدة
      const since = (now || performance.now()) - pulseAt;
      const boost = 1 + 0.45 * Math.exp(-Math.max(0, since) / 700);
      const mid = h / 2, amp = h * 0.36 * Math.min(boost, 1.38);
      const steps = Math.max(200, Math.round(w / (2 * dpr)));

      g.clearRect(0, 0, w, h);

      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255,0,146,0)');
      grad.addColorStop(0.15, 'rgba(255,0,146,1)');
      grad.addColorStop(0.85, 'rgba(255,0,146,1)');
      grad.addColorStop(1, 'rgba(255,0,146,0)');

      // خط ظل ناعم وراء الخط الأساسي
      g.lineJoin = 'round'; g.lineCap = 'round';
      g.strokeStyle = 'rgba(252,225,238,1)';
      g.lineWidth = 6 * dpr;
      g.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = i / steps;
        const y = mid + sample(x, t * 0.8 + 1.7, 0, 1.1, c) * amp * 0.8;
        i ? g.lineTo(x * w, y) : g.moveTo(x * w, y);
      }
      g.stroke();

      // الخط الأساسي مع توهّج خفيف
      g.strokeStyle = grad;
      g.lineWidth = 3.5 * dpr;
      g.shadowColor = 'rgba(255,0,146,.35)';
      g.shadowBlur = 10 * dpr * boost;
      g.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = i / steps;
        const y = mid + sample(x, t, s, 0, c) * amp;
        i ? g.lineTo(x * w, y) : g.moveTo(x * w, y);
      }
      g.stroke();
      g.shadowBlur = 0;
    }

    function frame(now) {
      if (!active) return;
      draw(now - t0, now);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      stop();
      if (reducedMotion.matches) {           // صورة ثابتة بلحظة التعليقة
        draw(STUTTER * 0.42);
        return;
      }
      active = true;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { active = false; cancelAnimationFrame(raf); }
    function pulse() {
      pulseAt = performance.now();
      if (reducedMotion.matches && current === 'home') draw(STUTTER * 0.42);
    }

    window.addEventListener('resize', () => { if (current === 'home' && !active) start(); });
    reducedMotion.addEventListener && reducedMotion.addEventListener('change', () => { if (current === 'home') start(); });
    return { start, stop, pulse };
  })();

  /* ---------- تشغيل ---------- */
  renderStatic();
  window.Stats.init();
  window.DAF.init();
  window.Quiz.init({ onFinish: () => show('result') });
  window.Game.init({ onQuiz: () => show('quiz') });
  window.Voices.load();                // قائمة تسجيلات «تحدّي الصبر» (إذا موجودة)

  homeBtn.addEventListener('click', () => show('home'));
  document.getElementById('playAgain').addEventListener('click', () => show('quiz'));
  document.getElementById('goDaf').addEventListener('click', () => show('daf'));
  document.getElementById('finaleBarBtn').addEventListener('click', () => show('finale'));
  document.getElementById('finaleRestart').addEventListener('click', newExperience);

  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(ev =>
    window.addEventListener(ev, bumpIdle, { passive: true, capture: true }));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { window.DAF.stop(); window.Game.reset(); HomeWave.stop(); }
    else if (current === 'home') HomeWave.start();
  });

  show('home', { silent: true });
  bumpIdle();

  /* ---------- بدون إنترنت (Service Worker) ----------
   * على Netlify (https) بنحفظ كل الملفات بالمتصفح عشان يشتغل أوفلاين.
   * على localhost ما بنسجّله (عشان التعديلات تبين مباشرة)، إلا مع ?sw=1 للفحص.
   */
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if ('serviceWorker' in navigator && (!isLocal || /[?&]sw=1/.test(location.search))) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
