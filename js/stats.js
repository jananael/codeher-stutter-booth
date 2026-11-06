/*
 * إحصائيات البوث: عدّادات محفوظة على الجهاز (localStorage)، بدون إنترنت.
 * اللوحة بتفتح بضغطة مطوّلة (٢ ثانية) على اللوغو، أو Ctrl+Shift+S.
 */
window.Stats = (function () {
  const KEY = 'booth-stats-v1';
  const COUNTERS = ['sessions', 'voice', 'quiz', 'patience', 'interruptions', 'perfect', 'complete3', 'compare'];
  const LONG_PRESS_MS = 2000;

  function blank() {
    const d = { feelings: {} };
    COUNTERS.forEach(k => { d[k] = 0; });
    return d;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* تخزين مش متاح */ }
    return blank();
  }

  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ما في تخزين: منكمّل بدونه */ }
  }

  function inc(key, n) {
    const d = load();
    d[key] = (d[key] || 0) + (n || 1);
    save(d);
  }

  function incFeeling(id) {
    const d = load();
    d.feelings[id] = (d.feelings[id] || 0) + 1;
    save(d);
  }

  /* ---------- اللوحة ---------- */
  const el = {};
  let resetArmed = false;

  function init() {
    const S = window.CONTENT.stats;
    el.panel = document.getElementById('statsPanel');
    el.title = document.getElementById('statsTitle');
    el.note = document.getElementById('statsNote');
    el.grid = document.getElementById('statsGrid');
    el.feelingsTitle = document.getElementById('statsFeelingsTitle');
    el.feelings = document.getElementById('statsFeelings');
    el.close = document.getElementById('statsClose');
    el.reset = document.getElementById('statsReset');
    el.sound = document.getElementById('statsSound');
    el.soundHint = document.getElementById('statsSoundHint');

    el.title.textContent = S.title;
    el.note.textContent = S.note;
    el.feelingsTitle.textContent = S.feelingsTitle;
    el.close.textContent = S.close;
    el.sound.textContent = S.soundTest;
    el.soundHint.textContent = S.soundHint;

    el.close.addEventListener('click', close);
    el.reset.addEventListener('click', onReset);
    el.sound.addEventListener('click', playTone);
    el.panel.addEventListener('click', e => { if (e.target === el.panel) close(); });
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) { e.preventDefault(); open(); }
      else if (e.key === 'Escape' && !el.panel.hidden) close();
    });

    // ضغطة مطوّلة على اللوغو
    const logo = document.getElementById('logo');
    let timer = 0;
    const cancel = () => clearTimeout(timer);
    logo.addEventListener('pointerdown', () => { cancel(); timer = setTimeout(open, LONG_PRESS_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => logo.addEventListener(ev, cancel));
    logo.addEventListener('contextmenu', e => e.preventDefault());
  }

  function render() {
    const S = window.CONTENT.stats;
    const d = load();
    const ar = window.toArabicDigits;
    el.grid.innerHTML = '';
    COUNTERS.forEach(k => {
      const item = document.createElement('div');
      item.className = 'stat';
      item.innerHTML = '<span class="stat__num"></span><span class="stat__label"></span>';
      item.querySelector('.stat__num').textContent = ar(d[k] || 0);
      item.querySelector('.stat__label').textContent = S.items[k];
      el.grid.appendChild(item);
    });
    el.feelings.innerHTML = '';
    window.CONTENT.daf.reflection.options.forEach(o => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><strong></strong>';
      li.querySelector('span').textContent = o.label;
      li.querySelector('strong').textContent = ar(d.feelings[o.id] || 0);
      el.feelings.appendChild(li);
    });
  }

  function open() {
    render();
    resetArmed = false;
    el.reset.textContent = window.CONTENT.stats.reset;
    el.reset.classList.remove('is-armed');
    el.panel.hidden = false;
    el.close.focus();
  }

  function close() { el.panel.hidden = true; el.soundHint.hidden = true; }

  /** تجربة صوت: نغمة هادية (٤٤٠ هرتز) لمدة ثانيتين، بدخول وخروج ناعم. */
  let toneCtx = null;
  function playTone() {
    el.soundHint.hidden = false;
    if (toneCtx) return;                      // النغمة شغّالة
    try {
      toneCtx = new (window.AudioContext || window.webkitAudioContext)();
      const t = toneCtx.currentTime;
      const osc = toneCtx.createOscillator();
      const gain = toneCtx.createGain();
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.15);
      gain.gain.setValueAtTime(0.18, t + 1.85);
      gain.gain.linearRampToValueAtTime(0, t + 2);
      osc.connect(gain).connect(toneCtx.destination);
      osc.start(t);
      osc.stop(t + 2.05);
      osc.onended = () => { toneCtx.close().catch(() => {}); toneCtx = null; };
    } catch (e) { toneCtx = null; }
  }

  /** التصفير بيحتاج ضغطتين (تأكيد جوّا الصفحة، بدون popups). */
  function onReset() {
    const S = window.CONTENT.stats;
    if (!resetArmed) {
      resetArmed = true;
      el.reset.textContent = S.resetConfirm;
      el.reset.classList.add('is-armed');
      return;
    }
    save(blank());
    resetArmed = false;
    el.reset.textContent = S.resetDone;
    el.reset.classList.remove('is-armed');
    render();
  }

  return { init, inc, incFeeling, open, close, isOpen: () => el.panel && !el.panel.hidden };
})();
