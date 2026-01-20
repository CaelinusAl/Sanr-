// 112. Kitap: Kendini Yaratan Tanrıça - Ritüel Verileri - BILINGUAL (TR/EN)

// ============================================
// MIKRO RİTÜELLER (1-3 dk) - BILINGUAL
// ============================================

export const mikroRituellerData = {
  tr: [
    {
      id: "mikro-1",
      title: "Nefes Farkındalığı",
      subtitle: "Şimdiye Dönüş",
      duration: "2 dk",
      durationSeconds: 120,
      type: "mikro",
      intention: "Zihni şimdiki ana getirmek",
      steps: [
        { text: "Gözlerini yavaşça kapat.", duration: 5 },
        { text: "Nefesini izle. Zorlamadan.", duration: 15 },
        { text: "Nefes alırken: 'Ben buradayım.'", duration: 20 },
        { text: "Nefes verirken: 'Bu an yeterli.'", duration: 20 },
        { text: "3 nefes daha. Sessizce.", duration: 30 },
        { text: "Gözlerini aç. Yavaşça.", duration: 10 },
      ],
    },
    {
      id: "mikro-2",
      title: "Topraklama",
      subtitle: "Bedenle Bağlantı",
      duration: "3 dk",
      durationSeconds: 180,
      type: "mikro",
      intention: "Bedeni hissetmek ve topraklamak",
      steps: [
        { text: "Ayaklarını yere bas. Hisset.", duration: 10 },
        { text: "Yerçekimini fark et. Sen düşmüyorsun.", duration: 15 },
        { text: "Omuzlarını gevşet. Çeneni gevşet.", duration: 15 },
        { text: "Nefes al — enerji yukarı çıkıyor.", duration: 20 },
        { text: "Nefes ver — enerji aşağı iniyor.", duration: 20 },
        { text: "Kök sal. Ağaç gibi. Sabit ama canlı.", duration: 30 },
        { text: "3 derin nefes. Sonra aç.", duration: 20 },
      ],
    },
    {
      id: "mikro-3",
      title: "Niyet Tohumu",
      subtitle: "Günün Başlangıcı",
      duration: "1 dk",
      durationSeconds: 60,
      type: "mikro",
      intention: "Güne bilinçli başlamak",
      steps: [
        { text: "Bir an dur.", duration: 5 },
        { text: "Bugün için tek bir niyet seç.", duration: 15 },
        { text: "Onu içinden söyle. Sessizce.", duration: 15 },
        { text: "O niyetin kalbine düştüğünü hayal et.", duration: 15 },
        { text: "Şimdi git. Niyet seninle.", duration: 10 },
      ],
    },
  ],

  en: [
    {
      id: "mikro-1",
      title: "Breath Awareness",
      subtitle: "Return to Now",
      duration: "2 min",
      durationSeconds: 120,
      type: "mikro",
      intention: "Bring the mind to the present moment",
      steps: [
        { text: "Slowly close your eyes.", duration: 5 },
        { text: "Watch your breath. Without forcing.", duration: 15 },
        { text: "As you breathe in: 'I am here.'", duration: 20 },
        { text: "As you breathe out: 'This moment is enough.'", duration: 20 },
        { text: "3 more breaths. In silence.", duration: 30 },
        { text: "Open your eyes. Slowly.", duration: 10 },
      ],
    },
    {
      id: "mikro-2",
      title: "Grounding",
      subtitle: "Body Connection",
      duration: "3 min",
      durationSeconds: 180,
      type: "mikro",
      intention: "Feel and ground the body",
      steps: [
        { text: "Press your feet to the ground. Feel it.", duration: 10 },
        { text: "Notice gravity. You are not falling.", duration: 15 },
        { text: "Relax your shoulders. Relax your jaw.", duration: 15 },
        { text: "Breathe in — energy rises.", duration: 20 },
        { text: "Breathe out — energy descends.", duration: 20 },
        { text: "Take root. Like a tree. Stable but alive.", duration: 30 },
        { text: "3 deep breaths. Then open.", duration: 20 },
      ],
    },
    {
      id: "mikro-3",
      title: "Intention Seed",
      subtitle: "Start of Day",
      duration: "1 min",
      durationSeconds: 60,
      type: "mikro",
      intention: "Begin the day consciously",
      steps: [
        { text: "Pause for a moment.", duration: 5 },
        { text: "Choose one intention for today.", duration: 15 },
        { text: "Say it inside. Silently.", duration: 15 },
        { text: "Imagine that intention falling into your heart.", duration: 15 },
        { text: "Now go. The intention is with you.", duration: 10 },
      ],
    },
  ]
};

// ============================================
// DERİN RİTÜELLER (7-12 dk) - BILINGUAL
// ============================================

export const derinRituellerData = {
  tr: [
    {
      id: "derin-1",
      title: "Beden Taraması",
      subtitle: "İçe Yolculuk",
      duration: "8 dk",
      durationSeconds: 480,
      type: "derin",
      intention: "Bedendeki duyguları fark etmek",
      steps: [
        { text: "Rahat bir pozisyon al. Gözlerini kapat.", duration: 15 },
        { text: "Başının tepesinden başla. Ne hissediyorsun?", duration: 30 },
        { text: "Alnına in. Gerginlik var mı?", duration: 25 },
        { text: "Gözlerin, çenen... gevşesinler.", duration: 25 },
        { text: "Boğazına gel. Söylenmemiş ne var?", duration: 30 },
        { text: "Omuzlara in. Neyi taşıyorsun?", duration: 30 },
        { text: "Göğsüne gel. Kalp ne hissediyor?", duration: 40 },
        { text: "Karnına in. Bir şey mi sıkışmış?", duration: 30 },
        { text: "Kalçalara, bacaklara, ayaklara...", duration: 40 },
        { text: "Tüm bedenini bir bütün olarak hisset.", duration: 40 },
        { text: "Teşekkür et. Bu beden seni taşıyor.", duration: 30 },
        { text: "3 derin nefes. Yavaşça dön.", duration: 30 },
      ],
    },
    {
      id: "derin-2",
      title: "Gölge ile Karşılaşma",
      subtitle: "Kabul Ritüeli",
      duration: "10 dk",
      durationSeconds: 600,
      type: "derin",
      intention: "Bastırılmış duyguyu kabul etmek",
      steps: [
        { text: "Sessiz bir yerde otur. Gözlerini kapat.", duration: 15 },
        { text: "Bugün kaçındığın bir duyguyu düşün.", duration: 30 },
        { text: "O duyguya bir isim ver. Ne?", duration: 30 },
        { text: "O duygu bedenin neresinde?", duration: 30 },
        { text: "Ona 'Seni görüyorum' de.", duration: 30 },
        { text: "Yargılamadan izle. Ne anlatmak istiyor?", duration: 60 },
        { text: "'Burada olabilirsin' de.", duration: 30 },
        { text: "Onu değiştirmeye çalışma. Sadece izle.", duration: 60 },
        { text: "Teşekkür et. 'Beni korumaya çalıştın.'", duration: 30 },
        { text: "3 derin nefes al.", duration: 30 },
        { text: "Gölge de sensin. Kabul et.", duration: 30 },
        { text: "Yavaşça gözlerini aç.", duration: 15 },
      ],
    },
  ],

  en: [
    {
      id: "derin-1",
      title: "Body Scan",
      subtitle: "Journey Inward",
      duration: "8 min",
      durationSeconds: 480,
      type: "derin",
      intention: "Notice emotions in the body",
      steps: [
        { text: "Find a comfortable position. Close your eyes.", duration: 15 },
        { text: "Start from the top of your head. What do you feel?", duration: 30 },
        { text: "Move to your forehead. Any tension?", duration: 25 },
        { text: "Your eyes, your jaw... let them soften.", duration: 25 },
        { text: "Come to your throat. What's left unsaid?", duration: 30 },
        { text: "Move to your shoulders. What are you carrying?", duration: 30 },
        { text: "Come to your chest. What does the heart feel?", duration: 40 },
        { text: "Move to your belly. Is something stuck?", duration: 30 },
        { text: "Hips, legs, feet...", duration: 40 },
        { text: "Feel your whole body as one.", duration: 40 },
        { text: "Give thanks. This body carries you.", duration: 30 },
        { text: "3 deep breaths. Slowly return.", duration: 30 },
      ],
    },
    {
      id: "derin-2",
      title: "Meeting the Shadow",
      subtitle: "Acceptance Ritual",
      duration: "10 min",
      durationSeconds: 600,
      type: "derin",
      intention: "Accept a suppressed emotion",
      steps: [
        { text: "Sit in a quiet place. Close your eyes.", duration: 15 },
        { text: "Think of an emotion you avoided today.", duration: 30 },
        { text: "Give that emotion a name. What is it?", duration: 30 },
        { text: "Where in your body is that emotion?", duration: 30 },
        { text: "Say to it: 'I see you.'", duration: 30 },
        { text: "Watch without judgment. What does it want to tell you?", duration: 60 },
        { text: "Say: 'You can be here.'", duration: 30 },
        { text: "Don't try to change it. Just observe.", duration: 60 },
        { text: "Say thank you. 'You tried to protect me.'", duration: 30 },
        { text: "Take 3 deep breaths.", duration: 30 },
        { text: "The shadow is also you. Accept it.", duration: 30 },
        { text: "Slowly open your eyes.", duration: 15 },
      ],
    },
  ]
};

// ============================================
// KAPANIŞ RİTÜELLERİ (1 dk) - BILINGUAL
// ============================================

export const kapanisRituellerData = {
  tr: [
    {
      id: "kapanis-1",
      title: "Günü Mühürle",
      subtitle: "Akşam Kapanışı",
      duration: "1 dk",
      durationSeconds: 60,
      type: "kapanis",
      intention: "Günü bilinçli kapatmak",
      steps: [
        { text: "Bugün bir şey iyi gitti mi?", duration: 15 },
        { text: "Onu içinden kutla. Küçük de olsa.", duration: 15 },
        { text: "Yarın ne bırakacaksın?", duration: 15 },
        { text: "'Bugün yeterliydi' de. Bırak.", duration: 15 },
      ],
    },
    {
      id: "kapanis-2",
      title: "Şükran Nefesi",
      subtitle: "Teşekkür Ritüeli",
      duration: "1 dk",
      durationSeconds: 60,
      type: "kapanis",
      intention: "Şükranla bitirmek",
      steps: [
        { text: "3 şey için minnettar ol.", duration: 20 },
        { text: "Her birini içinden söyle.", duration: 20 },
        { text: "Kalbine koy. Gülümse.", duration: 20 },
      ],
    },
  ],

  en: [
    {
      id: "kapanis-1",
      title: "Seal the Day",
      subtitle: "Evening Closure",
      duration: "1 min",
      durationSeconds: 60,
      type: "kapanis",
      intention: "Close the day consciously",
      steps: [
        { text: "Did something go well today?", duration: 15 },
        { text: "Celebrate it inside. Even if small.", duration: 15 },
        { text: "What will you leave behind tomorrow?", duration: 15 },
        { text: "Say: 'Today was enough.' Let go.", duration: 15 },
      ],
    },
    {
      id: "kapanis-2",
      title: "Gratitude Breath",
      subtitle: "Thankfulness Ritual",
      duration: "1 min",
      durationSeconds: 60,
      type: "kapanis",
      intention: "End with gratitude",
      steps: [
        { text: "Be grateful for 3 things.", duration: 20 },
        { text: "Say each one inside.", duration: 20 },
        { text: "Place them in your heart. Smile.", duration: 20 },
      ],
    },
  ]
};

// ============================================
// 112. KİTAP RİTÜELLERİ - BILINGUAL
// ============================================

export const kitap112RituellerData = {
  tr: [
    {
      id: "112-1",
      title: "Kendi Yaratıcılığını Hatırla",
      subtitle: "1. Kapı",
      duration: "7 dk",
      durationSeconds: 420,
      type: "112",
      chapter: 1,
      intention: "Yaratıcı gücünü hatırlamak",
      description: "Sen bir yaratıcısın. Her düşünce, her niyet bir yaratım.",
      steps: [
        { text: "Rahat otur. Ellerini kalbine koy.", duration: 15 },
        { text: "Hayatında ne yarattığını düşün.", duration: 30 },
        { text: "En küçük şey bile... Bir söz, bir gülümseme.", duration: 30 },
        { text: "'Ben yaratıyorum' de. İçinden.", duration: 20 },
        { text: "Yarın ne yaratmak istiyorsun?", duration: 40 },
        { text: "Onu kalbine yerleştir. Tohum gibi.", duration: 30 },
        { text: "Nefes al. Bu niyet büyüyecek.", duration: 30 },
        { text: "Gözlerini aç. Yaratıcı.", duration: 15 },
      ],
    },
    {
      id: "112-2",
      title: "Kendini Sev",
      subtitle: "2. Kapı",
      duration: "6 dk",
      durationSeconds: 360,
      type: "112",
      chapter: 2,
      intention: "Koşulsuz öz-sevgiyi geliştirmek",
      description: "Kendini sevmek, var olmana izin vermektir.",
      steps: [
        { text: "Ellerini kalbine koy.", duration: 15 },
        { text: "Kendine 'Seni seviyorum' de.", duration: 20 },
        { text: "Tuhaf geldiyse, neden?", duration: 30 },
        { text: "Sevilmemek için ne yaptın?", duration: 30 },
        { text: "O inancı bırak.", duration: 30 },
        { text: "'Olduğum gibi yeterliyim' de.", duration: 30 },
        { text: "'Kendime şefkat gösteriyorum' de.", duration: 30 },
        { text: "3 nefes. Sen değerlisin.", duration: 20 },
      ],
    },
  ],

  en: [
    {
      id: "112-1",
      title: "Remember Your Creativity",
      subtitle: "Gate 1",
      duration: "7 min",
      durationSeconds: 420,
      type: "112",
      chapter: 1,
      intention: "Remember your creative power",
      description: "You are a creator. Every thought, every intention is a creation.",
      steps: [
        { text: "Sit comfortably. Place your hands on your heart.", duration: 15 },
        { text: "Think about what you've created in your life.", duration: 30 },
        { text: "Even the smallest thing... A word, a smile.", duration: 30 },
        { text: "Say 'I create.' Inside.", duration: 20 },
        { text: "What do you want to create tomorrow?", duration: 40 },
        { text: "Place it in your heart. Like a seed.", duration: 30 },
        { text: "Breathe in. This intention will grow.", duration: 30 },
        { text: "Open your eyes. Creator.", duration: 15 },
      ],
    },
    {
      id: "112-2",
      title: "Love Yourself",
      subtitle: "Gate 2",
      duration: "6 min",
      durationSeconds: 360,
      type: "112",
      chapter: 2,
      intention: "Develop unconditional self-love",
      description: "Loving yourself is allowing yourself to exist.",
      steps: [
        { text: "Place your hands on your heart.", duration: 15 },
        { text: "Say to yourself: 'I love you.'", duration: 20 },
        { text: "If it felt strange, why?", duration: 30 },
        { text: "What did you do to not be loved?", duration: 30 },
        { text: "Let that belief go.", duration: 30 },
        { text: "Say: 'I am enough as I am.'", duration: 30 },
        { text: "Say: 'I show myself compassion.'", duration: 30 },
        { text: "3 breaths. You are valuable.", duration: 20 },
      ],
    },
  ]
};

// ============================================
// HELPER FUNCTIONS - Language-aware
// ============================================

// Get rituals for current language
export const getMikroRitueller = (lang = 'tr') => mikroRituellerData[lang] || mikroRituellerData.tr;
export const getDerinRitueller = (lang = 'tr') => derinRituellerData[lang] || derinRituellerData.tr;
export const getKapanisRitueller = (lang = 'tr') => kapanisRituellerData[lang] || kapanisRituellerData.tr;
export const get112Ritueller = (lang = 'tr') => kitap112RituellerData[lang] || kitap112RituellerData.tr;

// Legacy exports for backward compatibility (defaults to TR)
export const mikroRitueller = mikroRituellerData.tr;
export const derinRitueller = derinRituellerData.tr;
export const kapanisRituelleri = kapanisRituellerData.tr;
export const kitap112Rituelleri = kitap112RituellerData.tr;

// Get all rituals (language-aware)
export const getTumRitueller = (lang = 'tr') => [
  ...getMikroRitueller(lang),
  ...getDerinRitueller(lang),
  ...getKapanisRitueller(lang),
  ...get112Ritueller(lang),
];

export const tumRitueller = getTumRitueller('tr');

// Get ritual by ID (language-aware)
export const getRituelById = (id, lang = 'tr') => {
  const allRituals = getTumRitueller(lang);
  return allRituals.find(r => r.id === id);
};

// Get today's ritual (language-aware)
export const getBugunRitueli = (lang = 'tr') => {
  const rituals = getMikroRitueller(lang);
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const index = seed % rituals.length;
  return rituals[index];
};

// Get rituals by type (language-aware)
export const getRituellerByType = (type, lang = 'tr') => {
  const allRituals = getTumRitueller(lang);
  return allRituals.filter(r => r.type === type);
};
