/*
 * المحطة الثالثة: «تحدّي الصبر»
 * شخصية بتحكي جملة كلمة كلمة، وفيها وقفات. الأزرار المغرية بتلمع بالوقفات،
 * والتحدي إنك ما تضغطها وتستنى لآخر الجملة وبعدين تضغط «ردّ».
 */
window.Game = (function () {
  const G = window.CONTENT.game;
  const ar = n => window.toArabicDigits(n);
  const WORD_MS = 420;
  const REP_MS = 1200;

  const el = {};
  let roundIdx = 0, score = 0;
  let token = 0;               // بيتغيّر لما نوقف/نقاطع عشان نلغي أي توقيت شغّال
  let phase = 'intro';         // intro | speaking | done | feedback | end
  let currentGuess = null;     // الكلمة اللي الزر بيخمّنها بالوقفة الحالية
  let spokenCount = 0;         // كم كلمة انحكت
  let waitedMs = 0;            // قديش استنى بالوقفات بهاد الموقف
  let onQuiz = () => {};
  let order = G.rounds.map((_, i) => i);   // ترتيب المواقف، بيتخلط كل لعبة

  const round = () => G.rounds[order[roundIdx]];
  const isF = () => round().gender === 'f';
  const pick = v => (typeof v === 'string' ? v : v[round().gender]);
  const fb = key => G.feedback[key + (isF() && G.feedback[key + 'F'] ? 'F' : '')];
  const word = item => (typeof item === 'string' ? item : item.w);
  const clean = s => s.replace(/[،,.؟?!]/g, '').toLowerCase();
  const secs = ms => ar(Math.max(1, Math.round(ms / 1000)));

  function init(opts) {
    onQuiz = opts.onQuiz;
    ['gameIntro', 'gameTitle', 'gameIntroText', 'gameStart', 'gamePlay', 'gameRound', 'gameProgress',
     'gameAvatar', 'gameName', 'gameWhere', 'gameMeter', 'gameMeterText', 'gameBubble', 'gameHint', 'gameTempt', 'gameReply',
     'gameFeedback', 'gameVerdict', 'gameFeedbackText', 'gameNext',
     'gameEnd', 'gameEndTitle', 'gameQuote', 'gameScore', 'gameScoreLabel', 'gameMessage', 'gameAgain', 'gameToQuiz']
      .forEach(id => { el[id] = document.getElementById(id); });

    el.gameTitle.textContent = G.title;
    el.gameIntroText.textContent = G.intro;
    el.gameStart.textContent = G.start;
    el.gameEndTitle.textContent = G.result.headline;
    el.gameQuote.textContent = G.result.quote;
    el.gameMeterText.textContent = G.meter;
    el.gameScoreLabel.textContent = G.result.label;
    el.gameAgain.textContent = G.result.playAgain;
    el.gameToQuiz.textContent = G.result.tryQuiz;

    el.gameProgress.style.setProperty('--count', G.rounds.length);
    G.rounds.forEach(() => el.gameProgress.appendChild(document.createElement('span')));

    ['know', 'takeTime', 'hurry'].forEach(t => {
      el.gameTempt.querySelector('[data-type="' + t + '"]').textContent = G.tempt[t];
    });
    el.gameTempt.querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => interrupt(b.dataset.type)));
    el.gameStart.addEventListener('click', newGame);
    let evStart = 0;
    window.Voices.setEventListener(ev => {
      if (phase !== 'speaking') return;
      if (ev === 'start') { evStart = performance.now(); currentGuess = null; setTempt(true); }
      else { if (evStart) waitedMs += performance.now() - evStart; evStart = 0; setTempt(false); }
    });
    el.gameReply.addEventListener('click', reply);
    el.gameNext.addEventListener('click', next);
    el.gameAgain.addEventListener('click', newGame);
    el.gameToQuiz.addEventListener('click', () => onQuiz());

    reset();
  }

  /* ---------- الحالات ---------- */
  function view(name) {
    el.gameIntro.hidden = name !== 'intro';
    el.gamePlay.hidden = name !== 'play';
    el.gameEnd.hidden = name !== 'end';
  }

  function reset() {
    token++;
    window.Voices.stop();
    phase = 'intro';
    roundIdx = 0;
    score = 0;
    view('intro');
  }

  function stop() { token++; window.Voices.stop(); }

  function newGame() {
    // خلط عشوائي (Fisher–Yates)
    order = G.rounds.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    roundIdx = 0;
    score = 0;
    startRound();
  }

  function startRound() {
    const r = round();
    const my = ++token;
    phase = 'speaking';
    spokenCount = 0;
    waitedMs = 0;
    currentGuess = null;
    view('play');

    el.gameRound.textContent = G.roundLabel.replace('{n}', ar(roundIdx + 1)).replace('{total}', ar(G.rounds.length));
    [...el.gameProgress.children].forEach((s, i) => {
      s.classList.toggle('is-done', i < roundIdx);
      s.classList.toggle('is-current', i === roundIdx);
    });
    el.gameAvatar.textContent = r.name.charAt(0);
    el.gameName.textContent = r.name;
    el.gameWhere.textContent = r.where;
    el.gameBubble.textContent = '';
    el.gameBubble.classList.remove('is-cut');
    el.gameHint.textContent = '';
    el.gameReply.textContent = pick(G.reply);
    el.gameReply.hidden = true;
    el.gameMeter.hidden = false;
    el.gameFeedback.hidden = true;
    el.gameFeedback.classList.remove('is-correct', 'is-wrong');
    setTempt(false);
    el.gameTempt.querySelectorAll('button').forEach(b => { b.disabled = false; });

    speak(r, my);
    el.gameTitle.focus({ preventScroll: true });
  }

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  /**
   * الموقف بيتقسّم لمقاطع (js/voices.js). لو المقطع متسجّل بنشغّل الصوت،
   * والكلمات بتطلع موزّعة على مدّته. لو مش متسجّل بنكتفي بالنص زي قبل.
   */
  async function speak(r, my) {
    const V = window.Voices;
    const segs = V.segments(r);
    V.prepare(segs);
    await sleep(600);
    for (const seg of segs) {
      if (my !== token) return;

      if (seg.type === 'pause') {
        const dots = addSpan('dots', '<i></i><i></i><i></i>');
        currentGuess = seg.guess;
        setTempt(true);
        await sleep(seg.ms);
        if (my !== token) return;
        waitedMs += seg.ms;
        dots.remove();
        setTempt(false);
        currentGuess = null;
        continue;
      }

      if (seg.type === 'rep') {
        const repEl = addSpan('rep', '');
        repEl.textContent = seg.text + ' ';
        currentGuess = clean(seg.word);
        setTempt(true);
        const t0 = performance.now();
        if (V.has(seg.id)) await V.play(seg.id);
        if (my !== token) return;
        const left = REP_MS - (performance.now() - t0);
        if (left > 0) await sleep(left);
        if (my !== token) return;
        waitedMs += Math.max(REP_MS, performance.now() - t0);
        repEl.remove();
        setTempt(false);
        currentGuess = null;
        continue;
      }

      // say: الكلمات بتطلع موزّعة على مدّة التسجيل (أو كل WORD_MS بدون تسجيل).
      // وقت ما الصوت عالق (تأتأة من المعالج) الكلمات بتستنى كمان.
      let per = WORD_MS, playing = null;
      if (V.has(seg.id)) {
        playing = V.play(seg.id);
        per = Math.max(120, V.duration(seg.id) * 1000 / seg.words.length);
      }
      for (const w of seg.words) {
        if (my !== token) return;
        while (playing && V.isInEvent() && my === token) await sleep(40);
        if (my !== token) return;
        addSpan('word', '').textContent = w;
        spokenCount++;
        let waited = 0;
        while (waited < per && my === token) {
          await sleep(40);
          if (!(playing && V.isInEvent())) waited += 40;
        }
      }
      if (playing) await playing;
      if (my !== token) return;
      setTempt(false);
    }
    if (my !== token) return;

    phase = 'done';
    el.gameMeter.hidden = true;
    el.gameTempt.querySelectorAll('button').forEach(b => { b.disabled = true; });
    el.gameHint.textContent = isF() ? G.finishedF : G.finished;
    el.gameReply.hidden = false;
    el.gameReply.focus({ preventScroll: true });
  }

  function addSpan(cls, html) {
    if (el.gameBubble.childNodes.length) el.gameBubble.appendChild(document.createTextNode(' '));
    const s = document.createElement('span');
    s.className = cls;
    s.innerHTML = html;
    el.gameBubble.appendChild(s);
    return s;
  }

  /** الأزرار المغرية بتلمع بالوقفات، وزر «كمّل عنه» بيعرض تخمينه. */
  function setTempt(on) {
    el.gameTempt.classList.toggle('is-tempting', on);
    const complete = el.gameTempt.querySelector('[data-type="complete"]');
    complete.textContent = on && currentGuess
      ? pick(G.tempt.completeGuess).replace('{guess}', currentGuess)
      : pick(G.tempt.complete);
  }

  /* ---------- نتيجة كل موقف ---------- */
  function interrupt(type) {
    if (phase !== 'speaking') return;
    const guess = currentGuess;
    token++;
    window.Voices.stop();
    phase = 'feedback';
    window.Stats.inc('interruptions');

    // الكلمة اللي كان بده يحكيها = أول كلمة ما انحكت
    const r = round();
    const intended = r.words[spokenCount] ? clean(word(r.words[spokenCount])) : null;

    // نعرض الجملة كاملة، والجزء اللي ما انحكى باهت
    el.gameBubble.querySelectorAll('.dots, .rep').forEach(n => n.remove());
    r.words.slice(spokenCount).forEach(item => { addSpan('word is-unsaid', '').textContent = word(item); });
    el.gameBubble.classList.add('is-cut');
    setTempt(false);
    el.gameTempt.querySelectorAll('button').forEach(b => { b.disabled = true; });

    let text = (type === 'complete' || type === 'know') ? fb(type) : G.feedback[type];
    if (type === 'complete' && guess && intended) {
      const key = guess === intended ? 'rightGuess' : 'wrongGuess';
      text += ' ' + fb(key).replace('{word}', intended);
    }
    // «خذ وقتك» نيّتها حلوة، فالرد ألطف
    showFeedback(false, type === 'takeTime' ? G.feedback.gentle : G.feedback.interrupted, text);
  }

  function reply() {
    if (phase !== 'done') return;
    phase = 'feedback';
    score++;
    el.gameReply.hidden = true;
    const text = (isF() ? G.feedback.successTextF : G.feedback.successText) + ' ' +
                 G.feedback.waited.replace('{s}', secs(waitedMs));
    showFeedback(true, G.feedback.success, text);
  }

  function showFeedback(ok, verdict, text) {
    el.gameHint.textContent = '';
    el.gameReply.hidden = true;
    el.gameMeter.hidden = true;
    el.gameVerdict.textContent = verdict;
    el.gameFeedbackText.textContent = text;
    el.gameFeedback.classList.add(ok ? 'is-correct' : 'is-wrong');
    el.gameNext.textContent = roundIdx === G.rounds.length - 1 ? G.feedback.finish : G.feedback.next;
    el.gameFeedback.hidden = false;
    el.gameNext.focus({ preventScroll: true });
    el.gameFeedback.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function next() {
    if (roundIdx < G.rounds.length - 1) {
      roundIdx++;
      startRound();
    } else {
      phase = 'end';
      const total = G.rounds.length;
      window.Stats.inc('patience');
      if (score === total) window.Stats.inc('perfect');
      el.gameScore.textContent = G.result.score.replace('{n}', ar(score)).replace('{total}', ar(total));
      const scaled = Math.round(score * 3 / total);
      el.gameMessage.textContent = (G.result.messages.find(m => scaled >= m.min) || G.result.messages[G.result.messages.length - 1]).text;
      view('end');
      el.gameEndTitle.focus({ preventScroll: true });
      window.App.stationDone('game');
      window.App.celebrate(el.gameScore);
    }
  }

  return { init, reset, stop };
})();
