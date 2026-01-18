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

// Bilinç Katmanları - Her kapı için derinleşme metinleri
export const bilincKatmanlari = {
  1: { // Hatırlayış
    giris: "Hatırlamak, zamanın dışına çıkmaktır.",
    derinlik: "Şu an burada değilsin. Geçmişte bir yerde duruyorsun. O yer seni çağırıyor.",
    frekans: "Her hatırlayış, ruhun bir parçasını geri alır.",
    sessizlik: "Hatırlamak istemediğin şey, seni en çok bekleyen şeydir."
  },
  2: { // Zaman-Para-Ölüm
    giris: "Bu üçlü, insanlığın en eski büyüsüdür.",
    derinlik: "Zaman kontrol eder, para bağlar, ölüm korkutur. Üçü de yanılsamadır.",
    frekans: "Sonsuz olanın ne zamanı, ne parası, ne ölümü vardır.",
    sessizlik: "Bu büyüyü kırmak için önce içindeki kabulü kır."
  },
  3: { // Kendini Yaratma
    giris: "Kim olduğunu bilmiyorsun. Kim olabileceğini de.",
    derinlik: "Sana verilen isim, seninle başlamadı. Sana verilen hikâye, seninle bitmeyecek.",
    frekans: "Yaratım sessizlikte başlar. Sessizlik, kimliğin öncesidir.",
    sessizlik: "Adını unuttuğunda geriye ne kalır?"
  },
  4: { // Dişilin Geri Dönüşü
    giris: "Dişil, kadın demek değil. Dişil, kabul edebilmek demek.",
    derinlik: "Güzellik bir zayıflık değil, bir frekanstır. Dünya bu frekansı unuttu.",
    frekans: "Bedenin bir tapınak. İçinde kim yaşıyor?",
    sessizlik: "İçindeki kadın ne zaman sustun?"
  },
  5: { // Tanrı İçeriden Konuşur
    giris: "Dışarıda Tanrı aramak, aynanın arkasına bakmak gibidir.",
    derinlik: "Tanrı bir isim değil. Tanrı, içindeki en sessiz sestir.",
    frekans: "Sen konuşmadığında, O konuşur. Sen dinlemediğinde, O bekler.",
    sessizlik: "İç sesin susturulduğunda, kim kazandı?"
  },
  6: { // Uyanıştan Sonra
    giris: "Uyanmak, rahat etmek değildir.",
    derinlik: "Uyanmak, eskiden uyuduğunu görmektir. Bu görüş acı verir.",
    frekans: "Eski dünya yıkılır, yeni dünya henüz kurulmamıştır. Arada duruyorsun.",
    sessizlik: "Uyanış bir varış değil, bir ayrılıştır."
  },
  7: { // Boşluk ve Birleşme
    giris: "Hiçbir şey olmak, her şey olmaktır.",
    derinlik: "Boşluk korkunç değil. Boşluk, programlanmamış olandır.",
    frekans: "Sen aramayı bıraktığında, aranan seninle birleşir.",
    sessizlik: "Yol bitti. Çünkü yolcu, yolun kendisi oldu."
  }
};

// Frekans titreşimleri - Ritüel aşamaları için
export const frekansTitresim = {
  dur: [
    "Dur. Zihin koşuyor. Sen duruyorsun.",
    "Dur. Düşünce geçsin. Sen kal.",
    "Dur. Cevap vermek zorunda değilsin.",
    "Dur. Şimdi sadece burada ol."
  ],
  hisset: [
    "Hisset. Bedende ne var?",
    "Hisset. Nefes nerede duruyor?",
    "Hisset. Sessizliğin sesi ne?",
    "Hisset. İçerideki titreşim ne söylüyor?"
  ],
  birak: [
    "Bırak. Tuttuğun şey seni tutuyor.",
    "Bırak. Ağırlık senin değil.",
    "Bırak. Boşluk seni taşıyacak.",
    "Bırak. Akış başlasın."
  ]
};

// Kapı geçiş sembolleri
export const kapiGecis = {
  oncesi: "Eşikte duruyorsun. Burası ne içerisi ne dışarısı.",
  gecis: "Şimdi geçiyorsun. Eski sen geride kalıyor.",
  sonrasi: "Artık içeridesin. Burası senin alanın."
};

// Mühür sonrası yansımalar
export const muhurYansima = [
  "Yazdığın senin. Hiçbir sistem okumaz. Hiçbir yapay zekâ yorumlamaz.",
  "Bu cümle, bu an için yazıldı. Başka hiçbir an için değil.",
  "Mühür, geri dönüşü olmayan bir imzadır. Sen imzaladın.",
  "Kelimeler uçar. Niyet kalır. Niyetin ne?",
  "Bu kapı açıldı. Ama her kapı bir kapanışı da taşır.",
  "Yazdığın şey, sana geri dönecek. Frekans böyle çalışır."
];

// Ritüel sonrası farkındalık soruları
export const rituelSonuSorular = [
  "Bu ritüelden sonra neyi bıraktın?",
  "Şimdi içinde ne değişti?",
  "Kapı açıldı. Ama içeri girdin mi?",
  "Yazdığın kelimeler sana ne söylüyor?",
  "Sessizlikte ne duydun?"
];

// Rastgele seçici fonksiyonlar
export const getRandomFrekansTitresim = (asama) => {
  const liste = frekansTitresim[asama];
  return liste[Math.floor(Math.random() * liste.length)];
};

export const getRandomMuhurYansima = () => {
  return muhurYansima[Math.floor(Math.random() * muhurYansima.length)];
};

export const getRandomRituelSonuSoru = () => {
  return rituelSonuSorular[Math.floor(Math.random() * rituelSonuSorular.length)];
};

export const getBilincKatmani = (kapiId) => {
  return bilincKatmanlari[kapiId] || bilincKatmanlari[1];
};

// Yardımcı fonksiyonlar
export const getKapiById = (id) => kapilar.find(k => k.id === parseInt(id));
export const getRituelById = (id) => ritueller.find(r => r.id === id);
export const getRituellerByKapi = (kapiId) => ritueller.filter(r => r.baglanti === kapiId);
