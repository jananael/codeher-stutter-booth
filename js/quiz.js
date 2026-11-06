/*
 * المحطة الثانية: «صح ولا خرافة؟» + شاشة النتيجة والنصائح.
 * ٨ أسئلة بتنحسب، وبعدها سؤال بونص واحد عشوائي (ما بينحسب من الـ ٨).
 */
window.Quiz = (function () {
  const Q = window.CONTENT.quiz;
  const R = window.CONTENT.result;
  const ar = n => window.toArabicDigits(n);
  const TOTAL = Q.questions.length;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = {};
  let index = 0;               // 0..TOTAL-1 = الأسئلة، TOTAL = سؤال البونص
  let score = 0;
  let bonusQ = null, bonusRight = false;
  let onFinish = () => {};

  const hasBonus = () => Array.isArray(Q.bonus) && Q.bonus.length > 0;
  const isBonus = () => index === TOTAL;
  const current = () => (isBonus() ? bonusQ : Q.questions[index]);

  function init(opts) {
    onFinish = opts.onFinish;

    ['quizTitle', 'quizCounter', 'quizProgress', 'quizStatement', 'choiceFact', 'choiceMyth',
     'quizExplain', 'quizVerdict', 'quizExplanation', 'quizNext',
     'resultTitle', 'resultScore', 'resultMessage', 'resultBonus', 'tipsTitle', 'tips', 'playAgain', 'goDaf']
      .forEach(id => { el[id] = document.getElementById(id); });

    el.quizTitle.textContent = Q.title;
    // أيقونة + كلمة، عشان الجواب ما يعتمد على اللون لحاله
    el.choiceFact.innerHTML = '<span class="choice__icon" aria-hidden="true">✓</span><span></span>';
    el.choiceFact.lastChild.textContent = Q.fact;
    el.choiceMyth.innerHTML = '<span class="choice__icon" aria-hidden="true">✕</span><span></span>';
    el.choiceMyth.lastChild.textContent = Q.myth;

    el.quizProgress.style.setProperty('--count', TOTAL);
    Q.questions.forEach(() => el.quizProgress.appendChild(document.createElement('span')));
    if (hasBonus()) {
      const star = document.createElement('span');
      star.className = 'progress__bonus';
      star.textContent = '⭐';
      el.quizProgress.appendChild(star);
      el.quizProgress.classList.add('progress--bonus');
    }

    [el.choiceFact, el.choiceMyth].forEach(b =>
      b.addEventListener('click', () => answer(b.dataset.answer)));
    el.quizNext.addEventListener('click', next);

    // شاشة النتيجة
    el.resultTitle.textContent = R.title;
    el.tipsTitle.textContent = R.tipsTitle;
    el.playAgain.textContent = R.playAgain;
    el.goDaf.textContent = R.tryDaf;
    R.tips.forEach((tip, i) => {
      const li = document.createElement('li');
      li.className = 'tip';
      li.innerHTML = '<span class="tip__num" aria-hidden="true"></span><h4 class="tip__title"></h4><p class="tip__text"></p>';
      li.querySelector('.tip__num').textContent = ar(i + 1);
      li.querySelector('.tip__title').textContent = tip.title;
      li.querySelector('.tip__text').textContent = tip.text;
      el.tips.appendChild(li);
    });

    reset();
  }

  function reset() {
    index = 0;
    score = 0;
    bonusRight = false;
    bonusQ = hasBonus() ? Q.bonus[Math.floor(Math.random() * Q.bonus.length)] : null;
    render();
  }

  /** بتعيد تشغيل حركة CSS على عنصر (لما يتغيّر السؤال). */
  function replay(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function render() {
    const q = current();
    el.quizCounter.textContent = isBonus()
      ? Q.bonusLabel
      : Q.counter.replace('{n}', ar(index + 1)).replace('{total}', ar(TOTAL));
    el.quizStatement.textContent = q.statement;
    el.quizStatement.classList.toggle('is-bonus', isBonus());
    replay(el.quizStatement, 'q-in');
    replay(el.choiceFact.parentElement, 'q-in');

    [...el.quizProgress.children].forEach((s, i) => {
      s.classList.toggle('is-done', i < index);
      s.classList.toggle('is-current', i === index);
    });

    [el.choiceFact, el.choiceMyth].forEach(b => {
      b.disabled = false;
      b.classList.remove('is-correct', 'is-wrong');
    });
    el.quizExplain.hidden = true;
    el.quizExplain.classList.remove('is-correct', 'is-wrong');
  }

  function answer(choice) {
    if (el.choiceFact.disabled) return;
    const q = current();
    const correct = choice === q.answer;
    if (isBonus()) bonusRight = correct;
    else if (correct) score++;

    el.choiceFact.disabled = el.choiceMyth.disabled = true;
    const rightBtn = q.answer === 'fact' ? el.choiceFact : el.choiceMyth;
    const pickedBtn = choice === 'fact' ? el.choiceFact : el.choiceMyth;
    rightBtn.classList.add('is-correct');
    if (!correct) pickedBtn.classList.add('is-wrong');

    const key = (correct ? 'correct' : 'wrong') + (q.answer === 'fact' ? 'Fact' : 'Myth');
    el.quizVerdict.textContent = Q.feedback[key];
    el.quizExplanation.textContent = q.explanation;
    el.quizExplain.classList.add(correct ? 'is-correct' : 'is-wrong');

    const isLast = isBonus() || (index === TOTAL - 1 && !hasBonus());
    el.quizNext.textContent = isLast ? Q.finish : Q.next;
    el.quizExplain.hidden = false;
    replay(el.quizExplain, 'is-revealing');   // الحكم، بعدين الشرح، بعدين الزر
    el.quizNext.focus({ preventScroll: true });
    el.quizExplain.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  }

  function next() {
    const lastIndex = hasBonus() ? TOTAL : TOTAL - 1;
    if (index < lastIndex) {
      index++;
      render();
      el.choiceFact.focus({ preventScroll: true });
    } else {
      showResult();
    }
  }

  function showResult() {
    el.resultScore.textContent = ar(score) + ' / ' + ar(TOTAL);
    // الرسائل مكتوبة على ٨ أسئلة؛ لو تغيّر العدد بنقيس بالنسبة
    const scaled = Math.round(score * 8 / TOTAL);
    const msg = R.messages.find(m => scaled >= m.min) || R.messages[R.messages.length - 1];
    el.resultMessage.textContent = msg.text;
    el.resultBonus.hidden = !bonusQ;
    if (bonusQ) el.resultBonus.textContent = bonusRight ? Q.bonusRight : Q.bonusWrong;
    window.Stats.inc('quiz');
    onFinish();
  }

  return { init, reset };
})();
