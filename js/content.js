/*
 * كل نصوص الموقع هون، بلغتين: ar (عربي) و en (English).
 * عدّلوا الجمل أو الأسئلة أو النصائح من هاد الملف بدون ما تلمسوا باقي الكود.
 * بالعربي اكتبوا الأرقام بالأرقام العربية الهندية (١٢٣) مباشرة.
 * لو زدتوا إشي بلغة، زيدوه باللغة الثانية كمان.
 */
window.CONTENT_ALL = {

  /* ============================== عربي ============================== */
  ar: {
    pageTitle: 'خلّيني أكمّل كلامي · CodeHer',

    header: {
      occasion: '٢٢ أكتوبر — اليوم العالمي للتوعية بالتأتأة',
      home: '← الرئيسية',
      logoAlt: 'CodeHer',
      langLabel: 'اللغة'
    },

    home: {
      titleHighlight: 'خـ.. خـ..',
      titleRest: ' خلّيني أكمّل كلامي',
      subtitle: 'واحد من كل مية شخص بيتأتئ. جرّب تعيش اللحظة، واعرف كيف تكون المستمع اللي بيستنى.',
      go: 'يلا',
      cards: [
        {
          target: 'daf',
          tag: 'المحطة الأولى · مع سماعات',
          title: 'جرّب تحكي',
          desc: 'اقرأ جملة بصوت عالي وصوتك راجعلك متأخر بجزء من الثانية.'
        },
        {
          target: 'quiz',
          tag: 'المحطة الثانية · دقيقتين',
          title: 'صح ولا خرافة؟',
          desc: '٨ جمل بنسمعها كثير عن التأتأة. قديش منها صحيح؟'
        },
        {
          target: 'game',
          tag: 'المحطة الثالثة · لعبة',
          title: 'تحدّي الصبر',
          desc: 'قديش بتقدر تستنى بدون ما تقاطع؟ أصعب مما بتتخيل.'
        }
      ]
    },

    // وضع الجذب: بيشتغل على الرئيسية بعد ١٥ ثانية بدون لمس
    attract: {
      cta: 'جاهز تجرّب؟',
      phrases: [
        'مش كل سكوت يعني إنّي خلصت كلامي.',
        'أحياناً بحتاج وقت، مش مساعدة.',
        'اسمع الفكرة، مش طريقة حكيها.',
        'واحد من كل مية شخص بيتأتئ.',
        'الكلمة جاهزة بالراس. بس بدها لحظة.'
      ]
    },

    daf: {
      title: 'جرّب تحكي',
      intro: 'رح تسمع صوتك بالسماعات وهو بيعلق ويتكرر، كأنك بتتأتئ. الهدف تحس للحظة كيف الكلمة ممكن تعلق وانت عارف تماماً شو بدك تحكي.',
      // الخطوة الحالية بتنضوي لحالها: قبل التشغيل «ابدأ»، وقت التشغيل «اقرأ»، وبعد الإيقاف «جاوب»
      steps: [
        'البس السماعات',
        'اختار القوة: خفيف، متوسط، أو قوي',
        'اضغط «ابدأ» واسمح بالمايكروفون',
        'اقرأ الجملة بصوت عالي وبسرعتك العادية، وما توقف',
        'اضغط «إيقاف» وجاوب: كيف كانت تجربتك؟'
      ],
      // خيارات المحطة: false = مخفي
      options: { delayMode: false, compare: false },
      warning: 'لازم سماعات. بدونها الصوت بيرجع من السماعة للمايك وبيصفّر.',
      readLabel: 'اقرأ بصوت عالي:',
      waveIn: 'صوتك',
      waveOut: 'اللي بتسمعه',
      start: 'ابدأ',
      stop: 'إيقاف',
      nextSentence: 'جملة ثانية',
      delayLabel: 'التأخير',
      // نوع التجربة: محاكاة (تكرار ومدّ ووقفات على صوتك) أو تأخير صوت
      modeLabel: 'نوع التجربة',
      modes: [
        { id: 'stutter', label: 'محاكاة تأتأة', isDefault: true },
        { id: 'delay',   label: 'تأخير الصوت' }
      ],
      intensityLabel: 'القوة',
      intensities: [
        { value: 1, label: 'خفيف' },
        { value: 2, label: 'متوسط', isDefault: true },
        { value: 3, label: 'قوي' }
      ],
      stutterBadge: 'محاكاة',
      simNote: 'هاي محاكاة تقريبية، مش نفس التأتأة الحقيقية. التأتأة بتختلف من شخص لشخص، ومش إشي بنضحك عليه.',
      delayNote: 'الصوت نفسه ما فيه تأتأة. التأخير هو اللي بيلخبط إيقاع كلامك إنت: كثير ناس بيبطّؤوا أو بيكرروا مقاطع غصب عنهم.',
      stutterUnavailable: 'المحاكاة مش مدعومة على هاد المتصفح، فشغّلنا تأخير الصوت بدالها.',
      // desc = وصف محايد بيبين جنب الموجتين (مش تصنيف صعوبة)
      delays: [
        { value: 0,   label: 'بدون',        badge: '٠ مللي ث',   desc: 'بدون تأخير' },
        { value: 150, label: '١٥٠ مللي ث', badge: '١٥٠ مللي ث', desc: 'تأخير خفيف' },
        { value: 200, label: '٢٠٠ مللي ث', badge: '٢٠٠ مللي ث', desc: 'تأخير متوسط', isDefault: true },
        { value: 300, label: '٣٠٠ مللي ث', badge: '٣٠٠ مللي ث', desc: 'تأخير أكبر' }
      ],
      status: {
        idle: 'البس السماعات، اختار القوة، واضغط «ابدأ».',
        requesting: 'لحظة... اسمح بالمايكروفون من النافذة اللي فوق.',
        running: 'يلا اقرأ الجملة بصوت عالي وبسرعتك العادية، وما توقف. إذا ما حسيت بفرق، علّي صوت السماعات.',
        runningNoDelay: 'هلأ بتسمع صوتك بدون تأخير. جرّب تقارن.',
        runningStutter: 'يلا اقرأ الجملة بصوت عالي وبسرعتك العادية... رح تسمع صوتك يعلق ويتكرر غصب عنك.',
        stopped: 'وقّفنا المايك. بتقدر تجرّب جملة ثانية أو تأخير مختلف.',
        error: 'ما قدرنا نوصل للمايكروفون. تأكد إنه السماعة موصولة، واضغط على أيقونة القفل جنب الرابط واسمح بالمايكروفون.'
      },
      reflection: {
        question: 'كيف كانت تجربتك؟',
        options: [
          { id: 'normal', label: 'عادي' },
          { id: 'focus',  label: 'احتجت أركّز أكثر' },
          { id: 'hard',   label: 'كان صعب أحكي' }
        ],
        message: 'اللي جرّبته هو تأثير تأخير الصوت، مش محاكاة للتأتأة. التأتأة تجربة مختلفة، والأهم إننا نعطي كل شخص الوقت والمساحة ليعبّر عن نفسه.',
        messageStutter: 'سمعت صوتك يعلق وانت عارف شو بدك تحكي؟ هاي محاكاة تقريبية، والتأتأة الحقيقية بتختلف من شخص لشخص. بس الإحساس نفسه: الفكرة جاهزة، والكلمة بدها وقت. فاستنى، وما تكمّل عنه.'
      },
      // «قارن حالك»: نفس الجملة مرتين، بدون تأخير ومع تأخير. بنقيس الوقت والوقفات بس، بدون تسجيل.
      compare: {
        open: 'قارن حالك: اقرأ مرتين وشوف الفرق',
        title: 'قارن حالك',
        intro: 'رح تقرأ نفس الجملة مرتين: مرة بدون تأخير، ومرة مع تأخير. الموقع بيقيس وقت القراءة والوقفات بس. ما في أي تسجيل، والصوت ما بيطلع من الجهاز.',
        step: 'الخطوة {n} من {total}',
        steps: [
          { label: 'بدون تأخير', delay: 0 },
          { label: 'مع تأخير ٢٠٠ مللي ث', delay: 200 }
        ],
        startReading: 'ابدأ القراءة',
        done: 'خلصت',
        cancel: 'إلغاء',
        calibrating: 'لحظة... خلّيك ساكت ثانية',
        listening: 'يلا اقرأ الجملة بصوت عالي...',
        noSpeech: 'ما سمعنا صوت واضح. قرّب من المايك وجرّب هاي الخطوة كمان مرة.',
        resultTitle: 'النتيجة',
        colNone: 'بدون تأخير',
        colDelay: 'مع تأخير',
        rowTime: 'وقت القراءة',
        rowPauses: 'الوقفات',
        seconds: '{s} ث',
        slower: 'مع التأخير قريت أبطأ بـ {p}٪',
        faster: 'مع التأخير قريت أسرع بـ {p}٪',
        same: 'سرعتك كانت تقريباً نفسها بالمرتين',
        message: 'كلامك تغيّر لما الظروف تغيّرت، مش لأنك ما بتعرف تحكي. نفس الإشي مع اللي بيتأتئ: الكلمة جاهزة، بس بدها وقت.',
        note: 'هاد قياس تقريبي لتأثير التأخير، مش تقييم لطريقة كلامك.',
        again: 'جرّب مرة ثانية',
        close: 'سكّر'
      },
      sentences: [
        'صباح الخير، اسمي سارة وبدرس بالجامعة، وبحب أشرب قهوة مع صحابي قبل المحاضرة.',
        'لو سمحت، بدي تذكرة لرام الله، وبعدين بدي أرجع بالباص اللي الساعة خمسة.',
        'المكتبة بتفتح الساعة ثمانية الصبح، وبتسكّر الساعة أربعة العصر كل يوم ما عدا الجمعة.',
        'مرحبا، أنا متصل عشان أسأل عن الوظيفة اللي نزلتوا إعلانها مبارح على الموقع.'
      ]
    },

    quiz: {
      title: 'صح ولا خرافة؟',
      fact: 'صح',
      myth: 'خرافة',
      counter: 'سؤال {n} من {total}',
      feedback: {
        correctMyth: 'صح عليك! هاي خرافة.',
        correctFact: 'صح عليك! هاي حقيقة.',
        wrongMyth: 'مش هيك. هاي خرافة.',
        wrongFact: 'مش هيك. هاي حقيقة.'
      },
      next: 'السؤال اللي بعده',
      finish: 'شوف نتيجتك',
      // answer: 'fact' = صح، 'myth' = خرافة
      questions: [
        {
          statement: 'التأتأة سببها التوتر أو الخوف.',
          answer: 'myth',
          explanation: 'التأتأة إلها أساس عصبي ووراثي في طريقة تنظيم الكلام بالدماغ. التوتر ممكن يزيدها، بس مش هو اللي بيسببها.'
        },
        {
          statement: 'إذا كمّلت الجملة عن الشخص، بتريّحه وبتساعده.',
          answer: 'myth',
          explanation: 'أغلب الناس اللي بيتأتئوا بيفضّلوا يكمّلوا كلامهم بنفسهم. التكميل بيوصل إحساس إنه كلامه مش مهم أو إنك مستعجل.'
        },
        {
          statement: 'حوالي ١٪ من الكبار حول العالم بيتأتئوا.',
          answer: 'fact',
          explanation: 'يعني ملايين الناس، ومنهم ناس حوالينا ممكن ما نكون منتبهين إلهم.'
        },
        {
          statement: 'الأشخاص اللي بيتأتئوا أقل ذكاءً أو ثقة من غيرهم.',
          answer: 'myth',
          explanation: 'ما في أي علاقة بين التأتأة والذكاء. والخجل اللي ممكن نشوفه أحياناً غالباً نتيجة ردود فعل الناس، مش سبب.'
        },
        {
          statement: '«خذ نفس وتهدّى» نصيحة بتساعد الشخص اللي بيتأتئ.',
          answer: 'myth',
          explanation: 'غالباً بتنفهم استخفاف وبتزيد الضغط. الأفضل تستنى بهدوء وتضل متطلع فيه بشكل طبيعي.'
        },
        {
          statement: 'التأتأة أكثر عند الذكور منها عند الإناث.',
          answer: 'fact',
          explanation: 'عند الكبار، الذكور تقريباً ٣ إلى ٤ أضعاف الإناث.'
        },
        {
          statement: 'الشخص اللي بيتأتئ ما بيقدر يكون ممثل أو متحدث ناجح.',
          answer: 'myth',
          explanation: 'في ممثلين وسياسيين ومذيعين معروفين بيتأتئوا. التأتأة ما بتحدد شو الشخص بيقدر يوصل.'
        },
        {
          statement: 'كثير من الأطفال اللي بيبلشوا يتأتئوا بيتحسّنوا مع الوقت.',
          answer: 'fact',
          explanation: 'نسبة كبيرة من الأطفال بتختفي عندهم التأتأة خلال سنوات قليلة، والتقييم المبكر عند أخصائي نطق بيفرق كثير.'
        }
      ],
      // سؤال إضافي واحد بينختار عشوائياً بآخر الكويز (ما بينحسب من الـ ٨)
      bonusLabel: 'سؤال إضافي ⭐',
      bonusRight: '⭐ وجاوبت سؤال البونص صح!',
      bonusWrong: '⭐ سؤال البونص كان صعب، بس هلأ صرت تعرف.',
      bonus: [
        {
          statement: 'الشخص اللي بيتأتئ بيعرف شو بده يحكي، حتى لو احتاج وقت ليقوله.',
          answer: 'fact',
          explanation: 'التأتأة ما بتعني إنه الشخص مش عارف شو بده يحكي. الفكرة جاهزة، والكلمة بدها وقت تطلع.'
        },
        {
          statement: 'كثير من الناس اللي بيتأتئوا بيقدروا يغنّوا بدون تأتأة.',
          answer: 'fact',
          explanation: 'الغنا أو الحكي بصوت واحد مع حدا ثاني غالباً بيطلع سلس، لأنه طريقة إنتاج الكلام بتختلف. هاد بيبيّن إنها مش «خوف» ولا «ضعف».'
        },
        {
          statement: 'التأتأة سببها طريقة تربية الأهل.',
          answer: 'myth',
          explanation: 'ما في دليل إنه أسلوب التربية بيسبب التأتأة. بس جو هادي وصبور بالبيت بيساعد الطفل يحكي براحة.'
        }
      ]
    },

    game: {
      title: 'تحدّي الصبر',
      intro: 'رح تسمع ٣ أشخاص بيحكوا معك، وأحياناً كلمة رح تعلق. رح تطلعلك أزرار مغرية زي «كمّل عنه». التحدي: ما تقاطع. استنى لآخر الجملة، وبعدين اضغط «ردّ».',
      start: 'يلا نبلش',
      roundLabel: 'موقف {n} من {total}',
      meter: 'بتقدر تستنى؟',
      // قوة التأتأة اللي بتنضاف على التسجيلات: ٠ بدون، ١ خفيف، ٢ متوسط، ٣ قوي، ٤ قوي جداً
      voiceStutter: 2,
      finished: 'خلص كلامه. هلأ دورك.',
      finishedF: 'خلصت كلامها. هلأ دورك.',
      reply: { m: 'ردّ عليه', f: 'ردّ عليها' },
      // الأزرار المغرية. {guess} = الكلمة اللي الزر بيخمّنها
      tempt: {
        complete:      { m: 'كمّل عنه', f: 'كمّل عنها' },
        completeGuess: { m: 'كمّل عنه: «{guess}»', f: 'كمّل عنها: «{guess}»' },
        know: 'بعرف شو بدك تحكي',
        takeTime: 'خذ وقتك، أنا بسمعك',
        hurry: 'احكي بسرعة، عندي محاضرة'
      },
      feedback: {
        success: 'برافو! استنيت للآخر.',
        successText: 'هيك وصّلت إنك سامع وإنه كلامه مهم.',
        successTextF: 'هيك وصّلت إنك سامع وإنه كلامها مهم.',
        waited: 'استنيت حوالي {s} ثواني بالوقفات، وهاي الثواني كانت كل الفرق.',
        interrupted: 'قاطعت!',
        gentle: 'نيّتك حلوة، بس...',
        complete: 'حتى لو عرفت الكلمة، الكلام كلامه. التكميل بيوصّل إنك مستعجل.',
        completeF: 'حتى لو عرفت الكلمة، الكلام كلامها. التكميل بيوصّل إنك مستعجل.',
        wrongGuess: 'وكمان، خمّنت غلط: كان بده يحكي «{word}».',
        wrongGuessF: 'وكمان، خمّنت غلط: كانت بدها تحكي «{word}».',
        rightGuess: 'صح خمّنت «{word}»، بس برضه كان بده يحكيها بنفسه.',
        rightGuessF: 'صح خمّنت «{word}»، بس برضه كانت بدها تحكيها بنفسها.',
        know: '«بعرف شو بدك تحكي» بتوصّل إنك مش محتاج تسمع باقي كلامه.',
        knowF: '«بعرف شو بدك تحكي» بتوصّل إنك مش محتاج تسمع باقي كلامها.',
        takeTime: 'التعليق على طريقة الكلام، حتى لو بلطف، بيلفت الانتباه إلها. أغلب الوقت أحسن إشي إنك تسمع بشكل طبيعي بدون تعليق.',
        hurry: 'الاستعجال بيزيد الضغط وبيخلّي الكلمة تعلق أكثر.',
        next: 'الموقف اللي بعده',
        finish: 'شوف نتيجتك'
      },
      result: {
        title: 'نتيجة التحدي',
        score: '{n} / {total}',
        label: 'مواقف استنيت فيها للآخر',
        headline: '٣ مواقف. ٣ أشخاص. كل اللي احتاجوه إنك تسمع.',
        quote: 'الصبر مش إنك تستنى دورك تحكي. الصبر إنك تعطي غيرك فرصته يكمّل.',
        messages: [
          { min: 3, text: 'مستمع صبور بامتياز! هاد بالضبط اللي بيفرق.' },
          { min: 2, text: 'قريب كثير! المرة الجاية استنى حتى لو الزر بيغريك.' },
          { min: 0, text: 'ولا يهمك، الإغراء حقيقي. بالحياة الحقيقية تذكّر: استنى.' }
        ],
        playAgain: 'العب مرة ثانية',
        tryQuiz: 'جرّب صح ولا خرافة؟'
      },
      /*
       * الجمل كلمة كلمة. ترتيب المواقف بيتغيّر عشوائياً كل لعبة.
       * block: وقفة قبل الكلمة (بالمللي ثانية)، guess: الكلمة اللي زر «كمّل عنه» بيخمّنها.
       * rep: مقطع بيتكرر قبل الكلمة.
       * gender: 'm' أو 'f' عشان الأزرار والرسائل.
       */
      rounds: [
        {
          id: 'yamen', name: 'يامن', gender: 'm', where: 'بالجامعة',
          words: ['مرحبا،', 'ممكن', 'تقلّي', 'وين',
            { w: 'قاعة', block: 2600, guess: 'المكتبة' },
            'المحاضرات', 'الجديدة؟', 'عندي',
            { w: 'محاضرة', rep: 'مـ.. مـ..' },
            { w: 'إحصاء', block: 2400, guess: 'برمجة' },
            'الساعة', 'عشرة،', 'وأول', 'مرة', 'بروح', 'عليها،',
            'وما', 'لقيت', 'حدا', 'أسأله', 'غير',
            { w: 'إنت.', block: 2200, guess: 'الحارس' }]
        },
        {
          id: 'ahmad', name: 'أحمد', gender: 'm', where: 'بالكافتيريا',
          words: ['بدّي',
            { w: 'كاسة', rep: 'كـ.. كـ..' },
            'قهوة', 'وسط،', 'ومعها',
            { w: 'كرواسون', block: 3000, guess: 'كرواسون' },
            'بالزعتر', 'لو', 'سمحت.', 'وكمان', 'بدي', 'أدفع', 'عن', 'صاحبي،', 'طلب',
            { w: 'ليمون', block: 2600, guess: 'عصير' },
            'بالنعنع،', 'وبدنا', 'ناخدهم',
            { w: 'معنا', block: 2200, guess: 'هون' },
            'لأنه', 'عنا', 'محاضرة', 'كمان', 'شوي.']
        },
        {
          id: 'rami', name: 'رامي', gender: 'm', where: 'بمقابلة شغل',
          words: ['أنا',
            { w: 'اسمي', block: 1800, guess: 'بدرس' },
            'رامي،', 'تخرّجت', 'من', 'هندسة',
            { w: 'الحاسوب', block: 2400, guess: 'الكهرباء' },
            'السنة', 'الماضية،', 'واشتغلت', 'ستة', 'شهور', 'على', 'تطبيق', 'لحجز',
            { w: 'المواعيد', rep: 'المـ.. المـ..' },
            'بالعيادات.', 'وأكثر', 'إشي', 'بحبه', 'هو',
            { w: 'البرمجة', block: 3200, guess: 'التصميم' },
            'مع', 'فريق.']
        }
      ]
    },

    result: {
      title: 'نتيجتك',
      // min = أقل نتيجة للرسالة (من الأعلى للأقل)
      messages: [
        { min: 7, text: 'بتعرف كثير عن التأتأة. شاركها مع غيرك!' },
        { min: 5, text: 'منيح! وصار عندك صورة أوضح هسا.' },
        { min: 0, text: 'ولا يهمك، هاد بالضبط سبب وجود البوث.' }
      ],
      tipsTitle: 'أربع أشياء بتفرق لما تحكي مع شخص بيتأتئ',
      tips: [
        { title: 'استنى', text: 'اعطيه الوقت الكافي يكمّل، بدون ما تقاطع.' },
        { title: 'ما تكمّل عنه', text: 'حتى لو عرفت الكلمة. الكلام كلامه.' },
        { title: 'ضل متطلع فيه', text: 'تواصل عين طبيعي بيقول: أنا سامعك ومش مستعجل.' },
        { title: 'اسمع الشو مش الكيف', text: 'ركّز على شو بيحكي، مش على طريقة حكيه.' }
      ],
      playAgain: 'العب مرة ثانية',
      tryDaf: 'جرّب المحطة الأولى'
    },

    // شاشة النهاية المشتركة: بتبين بس إذا الزائر خلّص المحطات الثلاث بنفس الجلسة
    finale: {
      kicker: 'YOU LISTENED. YOU LEARNED. YOU MADE A DIFFERENCE.',
      title: 'سمعت، تعلّمت، وصرت تعرف كيف تعطي غيرك مساحة يحكي.',
      stations: '{n} / {total} محطات',
      message: 'المرة الجاية لما تحكي مع حدا بيتأتئ: استنى، ما تكمّل عنه، واسمع الشو مش الكيف.',
      restart: 'ابدأ تجربة جديدة',
      bar: 'خلّصت المحطات الثلاث 🎉',
      barButton: 'شوف شاشة النهاية'
    },

    // الـ QR بيبين بس إذا في صورة assets/tips-qr.png (شوفوا README)
    qr: {
      caption: 'صوّر الكود وخذ النصائح معك',
      alt: 'رمز QR لصفحة النصائح'
    },

    // لوحة الإحصائيات (للمنظمين): ضغطة مطوّلة على اللوغو أو Ctrl+Shift+S
    stats: {
      title: 'إحصائيات البوث',
      note: 'محفوظة على هاد الجهاز بس. الجلسات مش بالضرورة عدد زوار مختلفين.',
      items: {
        sessions:      'الجلسات',
        voice:         'تجارب الصوت',
        quiz:          'كويزات مكتملة',
        patience:      'جولات تحدّي الصبر',
        interruptions: 'مرات المقاطعة',
        perfect:       'جولات بدون ولا مقاطعة',
        complete3:     'جلسات خلّصت المحطات الثلاث',
        compare:       'مقارنات «قارن حالك»'
      },
      feelingsTitle: 'كيف كانت تجربة الصوت؟',
      soundTest: '🔊 تجربة صوت',
      soundHint: 'لازم تسمعوا نغمة هادية بالسماعات لمدة ثانيتين. إذا عالية أو واطية، عدّلوا صوت الجهاز.',
      close: 'سكّر',
      reset: 'صفّر الإحصائيات',
      resetConfirm: 'متأكد؟ اضغط مرة ثانية للتصفير',
      resetDone: 'تم التصفير'
    }
  },

  /* ============================== English ============================== */
  en: {
    pageTitle: 'Let me finish · CodeHer',

    header: {
      occasion: 'October 22 — International Stuttering Awareness Day',
      home: '← Home',
      logoAlt: 'CodeHer',
      langLabel: 'Language'
    },

    home: {
      titleHighlight: 'L.. L..',
      titleRest: ' Let me finish what I’m saying',
      subtitle: 'About one in every hundred people stutters. Live the moment for a minute, and learn how to be the listener who waits.',
      go: 'Let’s go',
      cards: [
        {
          target: 'daf',
          tag: 'Station 1 · Headphones',
          title: 'Try speaking',
          desc: 'Read a sentence out loud and hear your voice come back a split second late.'
        },
        {
          target: 'quiz',
          tag: 'Station 2 · Two minutes',
          title: 'Fact or myth?',
          desc: '8 things we often hear about stuttering. How many are true?'
        },
        {
          target: 'game',
          tag: 'Station 3 · Game',
          title: 'Patience challenge',
          desc: 'Can you wait without interrupting? Harder than you think.'
        }
      ]
    },

    attract: {
      cta: 'Ready to try?',
      phrases: [
        'Silence doesn’t always mean I’m done talking.',
        'Sometimes I need time, not help.',
        'Listen to the idea, not the way it’s said.',
        'About one in every hundred people stutters.',
        'The word is ready. It just needs a moment.'
      ]
    },

    daf: {
      title: 'Try speaking',
      intro: 'You’ll hear your voice in the headphones getting stuck and repeating, as if you stutter. The goal is to feel, for a moment, how a word can get stuck even when you know exactly what you want to say.',
      steps: [
        'Put on the headphones',
        'Choose the strength: light, medium or strong',
        'Press “Start” and allow the microphone',
        'Read the sentence out loud at your normal pace, without stopping',
        'Press “Stop” and answer: how was it?'
      ],
      options: { delayMode: false, compare: false },
      warning: 'Headphones are required. Without them, the sound loops back into the mic and squeals.',
      readLabel: 'Read out loud:',
      waveIn: 'Your voice',
      waveOut: 'What you hear',
      start: 'Start',
      stop: 'Stop',
      nextSentence: 'Another sentence',
      delayLabel: 'Delay',
      modeLabel: 'Experience',
      modes: [
        { id: 'stutter', label: 'Stutter simulation', isDefault: true },
        { id: 'delay',   label: 'Delayed voice' }
      ],
      intensityLabel: 'Strength',
      intensities: [
        { value: 1, label: 'Light' },
        { value: 2, label: 'Medium', isDefault: true },
        { value: 3, label: 'Strong' }
      ],
      stutterBadge: 'Simulation',
      simNote: 'This is a rough simulation, not real stuttering. Stuttering differs from person to person, and it’s never something to laugh at.',
      delayNote: 'The sound itself has no stutter in it. The delay throws off your own rhythm: many people slow down or repeat syllables without meaning to.',
      stutterUnavailable: 'The simulation isn’t supported in this browser, so we switched to delayed voice.',
      delays: [
        { value: 0,   label: 'None',   badge: '0 ms',   desc: 'No delay' },
        { value: 150, label: '150 ms', badge: '150 ms', desc: 'Light delay' },
        { value: 200, label: '200 ms', badge: '200 ms', desc: 'Medium delay', isDefault: true },
        { value: 300, label: '300 ms', badge: '300 ms', desc: 'Longer delay' }
      ],
      status: {
        idle: 'Put on the headphones, choose the strength, and press “Start”.',
        requesting: 'One moment... allow the microphone in the prompt above.',
        running: 'Go ahead, read the sentence out loud at your normal pace, without stopping. If you don’t feel a difference, turn the headphone volume up.',
        runningNoDelay: 'You’re hearing yourself with no delay now. Compare the two.',
        runningStutter: 'Go ahead, read the sentence out loud at your normal pace... you’ll hear your voice get stuck and repeat.',
        stopped: 'Microphone off. Try another sentence or a different delay.',
        error: 'We couldn’t reach the microphone. Make sure the headset is plugged in, then click the lock icon next to the address and allow the microphone.'
      },
      reflection: {
        question: 'How was it?',
        options: [
          { id: 'normal', label: 'Normal' },
          { id: 'focus',  label: 'I had to concentrate more' },
          { id: 'hard',   label: 'It was hard to speak' }
        ],
        message: 'What you tried is the effect of delayed sound, not a simulation of stuttering. Stuttering is a different experience. What matters most is giving every person the time and space to express themselves.',
        messageStutter: 'Did you hear your voice get stuck while you knew what you wanted to say? This is a rough simulation, and real stuttering differs from person to person. But the feeling is the same: the idea is ready, the word needs time. So wait, and don’t finish for them.'
      },
      compare: {
        open: 'Compare yourself: read twice and see the difference',
        title: 'Compare yourself',
        intro: 'You’ll read the same sentence twice: once with no delay, once with a delay. We only measure reading time and pauses. Nothing is recorded, and no audio leaves this device.',
        step: 'Step {n} of {total}',
        steps: [
          { label: 'No delay', delay: 0 },
          { label: 'With a 200 ms delay', delay: 200 }
        ],
        startReading: 'Start reading',
        done: 'I’m done',
        cancel: 'Cancel',
        calibrating: 'One moment... stay quiet for a second',
        listening: 'Go ahead, read the sentence out loud...',
        noSpeech: 'We didn’t hear clear speech. Move closer to the mic and try this step again.',
        resultTitle: 'Result',
        colNone: 'No delay',
        colDelay: 'With delay',
        rowTime: 'Reading time',
        rowPauses: 'Pauses',
        seconds: '{s} s',
        slower: 'With the delay you read {p}% slower',
        faster: 'With the delay you read {p}% faster',
        same: 'Your pace was about the same both times',
        message: 'Your speech changed because the conditions changed, not because you don’t know how to speak. It’s the same for someone who stutters: the word is ready, it just needs time.',
        note: 'This is a rough measure of the delay’s effect, not an assessment of how you speak.',
        again: 'Try again',
        close: 'Close'
      },
      sentences: [
        'Good morning, my name is Sara, I study at the university, and I like having coffee with my friends before class.',
        'Excuse me, I’d like a ticket to Ramallah, and then I want to come back on the five o’clock bus.',
        'The library opens at eight in the morning and closes at four in the afternoon every day except Friday.',
        'Hello, I’m calling to ask about the job you posted on your website yesterday.'
      ]
    },

    quiz: {
      title: 'Fact or myth?',
      fact: 'Fact',
      myth: 'Myth',
      counter: 'Question {n} of {total}',
      feedback: {
        correctMyth: 'You got it! That’s a myth.',
        correctFact: 'You got it! That’s a fact.',
        wrongMyth: 'Not quite. That’s a myth.',
        wrongFact: 'Not quite. That’s a fact.'
      },
      next: 'Next question',
      finish: 'See your score',
      questions: [
        {
          statement: 'Stuttering is caused by stress or fear.',
          answer: 'myth',
          explanation: 'Stuttering has a neurological and genetic basis in how the brain organizes speech. Stress can make it more noticeable, but it isn’t the cause.'
        },
        {
          statement: 'Finishing someone’s sentence for them helps and relaxes them.',
          answer: 'myth',
          explanation: 'Most people who stutter prefer to finish their own words. Finishing for them sends the message that what they say doesn’t matter, or that you’re in a hurry.'
        },
        {
          statement: 'About 1% of adults around the world stutter.',
          answer: 'fact',
          explanation: 'That’s millions of people, including people around us we may not have noticed.'
        },
        {
          statement: 'People who stutter are less intelligent or less confident than others.',
          answer: 'myth',
          explanation: 'There is no link between stuttering and intelligence. Any shyness we might see is usually a result of how people react, not a cause.'
        },
        {
          statement: '“Take a breath and calm down” is helpful advice for someone who stutters.',
          answer: 'myth',
          explanation: 'It often comes across as condescending and adds pressure. It’s better to wait calmly and keep natural eye contact.'
        },
        {
          statement: 'Stuttering is more common in males than in females.',
          answer: 'fact',
          explanation: 'Among adults, males are about 3 to 4 times more likely to stutter.'
        },
        {
          statement: 'A person who stutters can’t be a successful actor or speaker.',
          answer: 'myth',
          explanation: 'Well-known actors, politicians and broadcasters stutter. Stuttering doesn’t define how far someone can go.'
        },
        {
          statement: 'Many children who start stuttering improve over time.',
          answer: 'fact',
          explanation: 'For a large share of children, stuttering fades within a few years, and an early assessment with a speech-language pathologist makes a big difference.'
        }
      ],
      bonusLabel: 'Bonus question ⭐',
      bonusRight: '⭐ And you got the bonus question right!',
      bonusWrong: '⭐ The bonus was a tough one, but now you know.',
      bonus: [
        {
          statement: 'A person who stutters knows exactly what they want to say, even if it takes time to say it.',
          answer: 'fact',
          explanation: 'Stuttering doesn’t mean the person doesn’t know what to say. The idea is ready; the word just needs time to come out.'
        },
        {
          statement: 'Many people who stutter can sing without stuttering.',
          answer: 'fact',
          explanation: 'Singing, or speaking in unison with someone else, is often fluent because speech is produced differently. It shows stuttering isn’t about “fear” or “weakness”.'
        },
        {
          statement: 'Stuttering is caused by the way parents raise their children.',
          answer: 'myth',
          explanation: 'There’s no evidence that parenting style causes stuttering. But a calm, patient home helps a child speak comfortably.'
        }
      ]
    },

    game: {
      title: 'Patience challenge',
      intro: 'Three people will talk to you, and sometimes a word will get stuck. Tempting buttons like “Finish for them” will pop up. The challenge: don’t interrupt. Wait until the sentence ends, then press “Reply”.',
      start: 'Let’s start',
      roundLabel: 'Situation {n} of {total}',
      meter: 'Can you wait?',
      voiceStutter: 2,
      finished: 'He’s done talking. Your turn.',
      finishedF: 'She’s done talking. Your turn.',
      reply: { m: 'Reply to him', f: 'Reply to her' },
      tempt: {
        complete:      { m: 'Finish for him', f: 'Finish for her' },
        completeGuess: { m: 'Finish for him: “{guess}”', f: 'Finish for her: “{guess}”' },
        know: 'I know what you mean',
        takeTime: 'Take your time, I’m listening',
        hurry: 'Hurry up, I have class'
      },
      feedback: {
        success: 'Well done! You waited until the end.',
        successText: 'That showed him you’re listening and that his words matter.',
        successTextF: 'That showed her you’re listening and that her words matter.',
        waited: 'You waited about {s} seconds through the pauses, and those seconds made all the difference.',
        interrupted: 'You interrupted!',
        gentle: 'Kind intention, but...',
        complete: 'Even if you knew the word, it’s his to say. Finishing for him signals you’re in a hurry.',
        completeF: 'Even if you knew the word, it’s hers to say. Finishing for her signals you’re in a hurry.',
        wrongGuess: 'And your guess was wrong: he wanted to say “{word}”.',
        wrongGuessF: 'And your guess was wrong: she wanted to say “{word}”.',
        rightGuess: 'You guessed “{word}” right, but he still wanted to say it himself.',
        rightGuessF: 'You guessed “{word}” right, but she still wanted to say it herself.',
        know: '“I know what you mean” suggests you don’t need to hear the rest of what he’s saying.',
        knowF: '“I know what you mean” suggests you don’t need to hear the rest of what she’s saying.',
        takeTime: 'Commenting on how someone speaks, even kindly, draws attention to it. Most of the time the best thing is to just listen naturally, without comment.',
        hurry: 'Rushing adds pressure and can make the word get stuck even more.',
        next: 'Next situation',
        finish: 'See your score'
      },
      result: {
        title: 'Challenge result',
        score: '{n} / {total}',
        label: 'situations where you waited until the end',
        headline: '3 situations. 3 people. All they needed was for you to listen.',
        quote: 'Patience isn’t waiting for your turn to talk. Patience is giving others the chance to finish.',
        messages: [
          { min: 3, text: 'A truly patient listener! That’s exactly what makes the difference.' },
          { min: 2, text: 'So close! Next time, wait even when the button is tempting.' },
          { min: 0, text: 'No worries, the temptation is real. In real life, remember: wait.' }
        ],
        playAgain: 'Play again',
        tryQuiz: 'Try Fact or myth?'
      },
      rounds: [
        {
          id: 'yamen', name: 'Yamen', gender: 'm', where: 'at university',
          words: ['Hi,', 'could', 'you', 'tell', 'me', 'where', 'the', 'new',
            { w: 'lecture', block: 2600, guess: 'library' },
            'halls', 'are?', 'I', 'have', 'a',
            { w: 'statistics', rep: 'st- st-' },
            'class', 'at',
            { w: 'ten,', block: 2400, guess: 'nine' },
            'it’s', 'my', 'first', 'time', 'going,', 'and', 'you’re', 'the', 'only', 'person', 'I', 'could',
            { w: 'ask.', block: 2200, guess: 'find' }]
        },
        {
          id: 'ahmad', name: 'Ahmad', gender: 'm', where: 'at the cafeteria',
          words: ['Can', 'I', 'get', 'a', 'medium',
            { w: 'coffee,', rep: 'c- c-' },
            'and', 'a',
            { w: 'croissant', block: 3000, guess: 'croissant' },
            'with', 'za’atar,', 'please.', 'I’d', 'also', 'like', 'to', 'pay', 'for', 'my', 'friend,', 'a',
            { w: 'lemon', block: 2600, guess: 'juice' },
            'mint,', 'and', 'we’ll', 'have', 'them',
            { w: 'outside', block: 2200, guess: 'here' },
            'because', 'we', 'have', 'class', 'soon.']
        },
        {
          id: 'rami', name: 'Rami', gender: 'm', where: 'in a job interview',
          words: ['My',
            { w: 'name', block: 1800, guess: 'major' },
            'is', 'Rami.', 'I', 'graduated', 'in',
            { w: 'computer', block: 2400, guess: 'electrical' },
            'engineering', 'last', 'year,', 'and', 'spent', 'six', 'months', 'building', 'an', 'app', 'for', 'booking',
            { w: 'appointments', rep: 'a- a-' },
            'at', 'clinics.', 'What', 'I', 'love', 'most', 'is',
            { w: 'coding', block: 3200, guess: 'design' },
            'with', 'a', 'team.']
        }
      ]
    },

    result: {
      title: 'Your score',
      messages: [
        { min: 7, text: 'You know a lot about stuttering. Share it with others!' },
        { min: 5, text: 'Nice! Now you have a clearer picture.' },
        { min: 0, text: 'No worries, that’s exactly why this booth exists.' }
      ],
      tipsTitle: 'Four things that make a difference when talking with someone who stutters',
      tips: [
        { title: 'Wait', text: 'Give them enough time to finish, without interrupting.' },
        { title: 'Don’t finish for them', text: 'Even if you know the word. Their words are theirs.' },
        { title: 'Keep eye contact', text: 'Natural eye contact says: I’m listening and I’m not in a hurry.' },
        { title: 'Hear the what, not the how', text: 'Focus on what they’re saying, not how they say it.' }
      ],
      playAgain: 'Play again',
      tryDaf: 'Try station 1'
    },

    finale: {
      kicker: 'YOU LISTENED. YOU LEARNED. YOU MADE A DIFFERENCE.',
      title: 'You listened, you learned, and now you know how to give others space to speak.',
      stations: '{n} / {total} stations',
      message: 'Next time you talk with someone who stutters: wait, don’t finish for them, and hear the what, not the how.',
      restart: 'Start a new experience',
      bar: 'You finished all three stations 🎉',
      barButton: 'See the finale'
    },

    qr: {
      caption: 'Scan to take the tips with you',
      alt: 'QR code for the tips page'
    },

    stats: {
      title: 'Booth stats',
      note: 'Stored on this device only. Sessions are not necessarily unique visitors.',
      items: {
        sessions:      'Sessions',
        voice:         'Voice experiments',
        quiz:          'Quizzes completed',
        patience:      'Patience challenge rounds',
        interruptions: 'Interruptions',
        perfect:       'Rounds with no interruptions',
        complete3:     'Sessions that finished all 3 stations',
        compare:       '“Compare yourself” runs'
      },
      feelingsTitle: 'How was the voice experiment?',
      soundTest: '🔊 Sound check',
      soundHint: 'You should hear a soft tone in the headphones for two seconds. If it’s too loud or quiet, adjust the device volume.',
      close: 'Close',
      reset: 'Reset stats',
      resetConfirm: 'Sure? Press again to reset',
      resetDone: 'Stats reset'
    }
  }
};

/* ---------- اختيار اللغة (العربي افتراضي) ---------- */
(function () {
  let lang = 'ar';
  try { if (localStorage.getItem('booth-lang') === 'en') lang = 'en'; } catch (e) { /* بدون تخزين: عربي */ }
  window.LANG = lang;
  window.CONTENT = window.CONTENT_ALL[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = window.CONTENT.pageTitle;
})();
