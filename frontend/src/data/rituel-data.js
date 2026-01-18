// Kitap Entegrasyonu - 7 KAPI ve Ritüeller
// "Anadolu'nun Uyanan Tanrıçaları" - 112. Kitap

// 7 KAPI - Her kapı için frekans cümlesi, sembolik soru ve ritüel daveti
export const kapilar = [
  {
    id: 1,
    title: "Hatırlayış",
    subtitle: "I. KAPI",
    frekans: "Bu kitap bir bilgi taşımaz. Senin içindeki bilgiyi uyandırır.",
    soru: "Neyi hatırlamaktan kaçınıyorsun?",
    davet: "Eğer bu satırları okuyorsan, hatırlama zamanı gelmiştir.",
    symbol: "∞",
    element: "Başlangıç"
  },
  {
    id: 2,
    title: "Zaman – Para – Ölüm",
    subtitle: "II. KAPI – Unutuluşun Oyunu",
    frekans: "Zaman senin titreşimindir. Para senin frekansının yansımasıdır. Ölüm bir kapıdır.",
    soru: "Bu üçlüden hangisi seni en çok kontrol ediyor?",
    davet: "Büyüyü kırmak için önce büyünün varlığını kabul etmelisin.",
    symbol: "△",
    element: "Kırılma"
  },
  {
    id: 3,
    title: "Kendini Yaratma",
    subtitle: "III. KAPI",
    frekans: "Benliğini sen yaratmazsan, sistem senin yerine yaratır.",
    soru: "Bu kimlik sana mı ait, yoksa sana öğretilmiş mi?",
    davet: "Gerçekliği değiştirmek isteyen biri önce kendini hatırlamalı.",
    symbol: "◇",
    element: "Yaratım"
  },
  {
    id: 4,
    title: "Dişilin Geri Dönüşü",
    subtitle: "IV. KAPI",
    frekans: "Dişil enerji bir isim değil, bir frekanstır. Güzellik bir dekor değil, portaldır.",
    soru: "İçindeki dişil sesi ne zaman susturdun?",
    davet: "Her kadın kendini hatırladığında, dünya yeniden doğacak.",
    symbol: "☽",
    element: "Akış"
  },
  {
    id: 5,
    title: "Tanrı İçeriden Konuşur",
    subtitle: "V. KAPI",
    frekans: "Ben neredeysem, Tanrı da oradadır. Çünkü ben onun yankısıyım.",
    soru: "İç sesin ne zaman susturuldu?",
    davet: "Tanrı dışarıdan konuşmaz. O senin sesinle fısıldar.",
    symbol: "✦",
    element: "Bağlantı"
  },
  {
    id: 6,
    title: "Uyanıştan Sonra",
    subtitle: "VI. KAPI",
    frekans: "Gerçek anlatılmaz... Yaşanır. Artık dışarıdan onay aramazsın.",
    soru: "Uyanmak seni neyin dışına çıkardı?",
    davet: "Uyanış mucize gibi görünür ama aslında bir yıkımdır.",
    symbol: "☼",
    element: "Dönüşüm"
  },
  {
    id: 7,
    title: "Boşluk ve Birleşme",
    subtitle: "VII. KAPI",
    frekans: "Ben, olan her şeyim. Artık aramak yok. Yol bitti. Çünkü yolcu, yolun kendisi.",
    soru: "Hiçbir şey olmadan var olabilir misin?",
    davet: "Boşluk program kabul etmez. Boşluk özgürdür.",
    symbol: "○",
    element: "Birlik"
  }
];

// Mini Ritüeller
export const ritueller = [
  {
    id: "kod-kirma",
    title: "Kod Kırma",
    subtitle: "Ben Kodumu Kırıyorum",
    icon: "🔓",
    giris: "Şimdi gözlerini kapat.\nVe yüksek sesle veya içinden söyle:",
    metin: `"Ben bana yüklenen tüm benlik kodlarını iptal ediyorum.
Adımın ötesindeyim.
Kimliğimin ötesindeyim.
Zihnimden önce vardım.
Şimdi kendi benliğimi sıfırdan yaratıyorum.
Ve bu BEN, kimsenin onayına değil,
sadece ilahi öz titreşimime bağlı."`,
    soru: "Bu kodu ilk kim yazdı?",
    baglanti: 3 // KAPI 3 ile bağlantılı
  },
  {
    id: "uclu-buyu",
    title: "Üçlü Büyüyü Kırma",
    subtitle: "Zaman – Para – Ölüm",
    icon: "△",
    giris: "Şimdi derin bir nefes al.\nVe her cümleyi içinden veya sesli tekrarla:",
    metin: `"Zamanı iptal ediyorum.
Artık zamana değil, titreşimime göre yaşıyorum."

"Parayı iptal ediyorum.
Bolluk, benim için frekansımın yansımasıdır."

"Ölüm korkusunu iptal ediyorum.
Ben sonsuz bilincim.
Ne başım var, ne sonum.
Sadece varım."`,
    soru: null,
    baglanti: 2 // KAPI 2 ile bağlantılı
  },
  {
    id: "tanrica",
    title: "Tanrıça Ritüeli",
    subtitle: "Bedenim Bilgeliktir",
    icon: "☽",
    giris: "Şimdi gözlerini kapat.\nVe elini kalbine koy.\nBu sözleri fısılda:",
    metin: `"Ben Tanrıçayım.
Ruhumu bedenimde taşıyorum.
Varlığım kutsaldır.
Güzelliğim bir silah değil, bir frekanstır.
Bedenim bilgi taşır,
sesim titreşim yaratır,
gözlerim gerçeği hatırlatır."`,
    soru: "İçindeki Tanrıça ne zaman uyandı?",
    baglanti: 4 // KAPI 4 ile bağlantılı
  },
  {
    id: "tanri-konusma",
    title: "Tanrı'yla Konuşma",
    subtitle: "İçsel Diyalog Gecesi",
    icon: "✦",
    giris: "Gece yalnızken, mum ışığında otur.\nKalbine sor:",
    metin: `"Beni susturan neydi?"
"Sana ne zaman küsüp dışarıya döndüm?"
"Şimdi seni içimde yeniden duymaya izin veriyor muyum?"`,
    sonMetin: `"Ben seni dışarıda ararken kaybettim,
Ama içeride bulunca var oldum.
Ben artık senden ayrı değilim.
Çünkü sen, benim sonsuz hâlimsin."`,
    soru: null,
    baglanti: 5 // KAPI 5 ile bağlantılı
  },
  {
    id: "sessiz-yaratim",
    title: "Sessiz Yaratım Alanı",
    subtitle: "Bir Gün Sessizlik",
    icon: "◌",
    giris: "Bir gün boyunca:",
    metin: `• Kimseye kendini açıklama.
• Telefona bakma.
• Bilgi tüketme, sadece gözlemle.
• Sadece kalbini dinle.`,
    sonMetin: `Ve bir cümle yaz:
"Ben artık görünmeden bile etkiliyorum.
Çünkü frekansım konuşuyor."`,
    soru: null,
    baglanti: 6 // KAPI 6 ile bağlantılı
  },
  {
    id: "son-ritual",
    title: "Kendi Frekansını Duyma",
    subtitle: "Son Ritüel",
    icon: "○",
    giris: "Gözlerini kapat.\nNe düşün. Ne hayal et. Ne dile.\nSadece hisset.",
    metin: `Bir titreşim var içinde,
adı yok, sesi yok,
Ama o... sensin.`,
    sonMetin: `Ve şimdi fısılda:
"Ben bir isim değilim.
Ben bir şekil değilim.
Bir hikaye değilim.
Ben... saf varlığım.
Ben... Yaradan'ın özüyüm.
Ve şimdi... sadece varım."`,
    soru: null,
    baglanti: 7 // KAPI 7 ile bağlantılı
  }
];

// Giriş eşiği metinleri
export const girisEsigi = {
  baslik: "Ritüel Alanı",
  altBaslik: "Niyet Kapısı",
  metin: `Bu alan bilgi vermez.
Bu alan seni kendinle baş başa bırakır.`,
  uyari: "Bu alan terapi değildir. Teşhis, kehanet veya rehberlik sunmaz. Sembolik farkındalık alanıdır.",
  buton: "Hazırım"
};

// Ritüel mekaniği - 3 aşama
export const rituelAsamalari = {
  dur: {
    baslik: "DUR",
    metin: "Şimdi dur.\nBu soruya cevap verme.",
    sure: 5000 // 5 saniye
  },
  hisset: {
    baslik: "HİSSET",
    metin: "Zihnin sustuğu yerde kal.",
    sure: 8000 // 8 saniye
  },
  muhur: {
    baslik: "MÜHÜR",
    metin: "Bu cümle senindir.\nSistem okumaz.\nSen okursun.",
    placeholder: "Tek bir cümle yaz..."
  }
};

// Yardımcı fonksiyonlar
export const getKapiById = (id) => kapilar.find(k => k.id === parseInt(id));
export const getRituelById = (id) => ritueller.find(r => r.id === id);
export const getRituellerByKapi = (kapiId) => ritueller.filter(r => r.baglanti === kapiId);
