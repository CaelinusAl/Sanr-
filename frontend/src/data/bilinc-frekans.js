// Bilinç ve Frekans Mikro-Metinleri
// Bu metinler okunmak için değil, durmak – hissetmek – ayarlanmak için.

// BİLİNÇ SAYFASI - Algıyı sakinleştiren mikro-metinler
export const bilincTexts = [
  {
    id: 1,
    text: `Düşünce bir ses.
Sen o ses değilsin.
Şu an sadece dinliyorsun.`,
    question: "Şu an zihninde hangi ses var?"
  },
  {
    id: 2,
    text: `Zihnin hızlandığında
anlam daralır.
Yavaşladığında
her şey yerli yerine oturur.`,
    question: "Ne zaman son yavaşladın?"
  },
  {
    id: 3,
    text: `Bir şey çözmeye çalışma.
Anlam, zorlandığında gelmez.
Alan açtığında gelir.`,
    question: "Neye alan açabilirsin?"
  },
  {
    id: 4,
    text: `Soruların cevaptan önce geldiğini fark et.
Bu, yanlış yolda olduğunu değil
eşiğe yaklaştığını gösterir.`,
    question: "Hangi eşiğe yaklaşıyorsun?"
  },
  {
    id: 5,
    text: `Her şeyin bir adı olmak zorunda değil.
Bazı şeyler hissedilmek ister.`,
    question: "Adlandıramadığın ne var?"
  },
  {
    id: 6,
    text: `Bilinç genişlediğinde
anlatma ihtiyacı azalır.
Şu an anlatma.
Sadece burada ol.`,
    question: null // Soru yok, sadece durma
  },
  {
    id: 7,
    text: `Gerçek bilmek
anlamak değil,
tanımaktır.
Tanıdık olan şeye dön.`,
    question: "Neyi tanıyorsun ama unutmuşsun?"
  },
  {
    id: 8,
    text: `Zihin ararken
kalp zaten biliyor.
Şu an hangisini dinliyorsun?`,
    question: "Kalbin ne söylüyor?"
  },
  {
    id: 9,
    text: `Anlam bazen
sessizlikte gelir.
Kelimeler susunca
bilgi konuşur.`,
    question: null
  },
  {
    id: 10,
    text: `Her düşünce bir dalga.
Sen denizsin.
Dalga geçer,
deniz kalır.`,
    question: "Hangi dalga seni yoruyor?"
  },
];

// FREKANS SAYFASI - Hissedilen, açıklanmayan mikro-metinler
// Burada soru YOK. Sadece durma alanı.
export const frekansTexts = [
  {
    id: 1,
    text: `Nefesin buradaysa
sen de buradasın.`
  },
  {
    id: 2,
    text: `Şimdi.
Başka bir zaman yok.`
  },
  {
    id: 3,
    text: `Sessizlik bir boşluk değil.
Ayardır.`
  },
  {
    id: 4,
    text: `Zihnin susunca
beden konuşur.`
  },
  {
    id: 5,
    text: `Her şey aynı anda olmak zorunda değil.
Bir şey yeter.`
  },
  {
    id: 6,
    text: `Denge bir hedef değil.
Bir hâl.
Şu an olduğu gibi.`
  },
  {
    id: 7,
    text: `Tutma.
Bırak.
Akış seni taşısın.`
  },
  {
    id: 8,
    text: `Şu an
her şey yolunda.
Zihnin ne derse desin.`
  },
  {
    id: 9,
    text: `Burası güvenli.
Şu an güvendesin.`
  },
  {
    id: 10,
    text: `Frekansın ayarlandığında
kelime gerekmez.`
  },
  {
    id: 11,
    text: `Bir nefes.
Sonra bir tane daha.
Bu kadar.`
  },
  {
    id: 12,
    text: `Olmak yeter.
Başka bir şey gerekmez.`
  },
];

// Rastgele metin seçici
export const getRandomBilincText = () => {
  return bilincTexts[Math.floor(Math.random() * bilincTexts.length)];
};

export const getRandomFrekansText = () => {
  return frekansTexts[Math.floor(Math.random() * frekansTexts.length)];
};

// Sıradaki metni getir (döngüsel)
export const getNextText = (currentId, texts) => {
  const currentIndex = texts.findIndex(t => t.id === currentId);
  const nextIndex = (currentIndex + 1) % texts.length;
  return texts[nextIndex];
};
