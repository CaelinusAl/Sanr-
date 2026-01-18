// SANRI Sembol ve Sayı Sözlüğü
// Caelinus - Anadolu'nun Uyanan Tanrıçaları

export const symbolDictionary = {
  ayna: { name: "Ayna", meaning: "yansıma / kendine dönüş" },
  kapi: { name: "Kapı", meaning: "eşik / seçim / geçiş" },
  spiral: { name: "Spiral", meaning: "dönüşüm / katman / zamanın kıvrımı" },
  su: { name: "Su", meaning: "duygu / akış / arınma" },
  ates: { name: "Ateş", meaning: "niyet / yakma / dönüşüm" },
  toprak: { name: "Toprak", meaning: "beden / gerçeklik / kök" },
  hava: { name: "Hava", meaning: "düşünce / mesaj / işaret" },
  isik: { name: "Işık", meaning: "farkındalık / görünür kılma" },
  karanlik: { name: "Karanlık", meaning: "bilinmeyen / gölge / iç derinlik" },
  ay: { name: "Ay", meaning: "iç dünya / sezgi / 'Ben'" },
  gunes: { name: "Güneş", meaning: "yön / görünürlük / yaşam enerjisi" },
  sonsuzluk: { name: "Sonsuzluk (∞)", meaning: "süreklilik / döngü / hatırlayış" },
  yol: { name: "Yol", meaning: "yönelim / arayış / süreç" },
  kopru: { name: "Köprü", meaning: "bağlantı / geçiş / iki dünya arası" },
  kus: { name: "Kuş", meaning: "özgürlük / mesaj / ruh" },
  agac: { name: "Ağaç", meaning: "kök / büyüme / yaşam döngüsü" },
  dag: { name: "Dağ", meaning: "engel / hedef / yükseliş" },
  deniz: { name: "Deniz", meaning: "bilinçdışı / sonsuzluk / derinlik" },
  yildiz: { name: "Yıldız", meaning: "rehberlik / umut / uzak ışık" },
  tohum: { name: "Tohum", meaning: "potansiyel / başlangıç / gizli güç" },
  cicek: { name: "Çiçek", meaning: "açılış / güzellik / geçicilik" },
  yilan: { name: "Yılan", meaning: "dönüşüm / bilgelik / gölge" },
  anahtar: { name: "Anahtar", meaning: "çözüm / erişim / sır" },
  maske: { name: "Maske", meaning: "persona / gizleme / rol" },
  golge: { name: "Gölge", meaning: "bastırılmış / bilinmeyen ben / karanlık yüz" },
};

export const numberDictionary = {
  1: { meaning: "birlik / başlangıç / niyet" },
  2: { meaning: "dualite / aynalama / seçim" },
  3: { meaning: "akış / yaratım / köprü" },
  4: { meaning: "madde / yapı / düzen / dünya" },
  5: { meaning: "değişim / hareket / özgürlük" },
  6: { meaning: "uyum / sevgi / denge" },
  7: { meaning: "içe dönüş / sınav / derinlik" },
  8: { meaning: "güç / süreklilik / sistem" },
  9: { meaning: "tamamlama / şifa / kapanış" },
  10: { meaning: "döngü sonu / yeni başlangıç" },
  11: { meaning: "sezgi kapısı / uyanış" },
  12: { meaning: "arketip döngüsü / tanrıçalar / tamamlanan çember" },
  13: { meaning: "dönüşüm / ölüm-yeniden doğuş" },
  21: { meaning: "dünya / tamamlanmış yolculuk" },
  33: { meaning: "eşik / ustalık / kapı bilinci" },
  40: { meaning: "olgunlaşma / sabır / sınav süresi" },
  47: { meaning: "mühür / kod / eşik sayısı (Caelinus evreninde özel)" },
  81: { meaning: "Anadolu'nun tamamı / ruh haritası / kolektif hafıza" },
};

// Rastgele sembol seç
export const getRandomSymbols = (count = 2) => {
  const keys = Object.keys(symbolDictionary);
  const selected = [];
  const usedIndices = new Set();
  
  while (selected.length < count && selected.length < keys.length) {
    const index = Math.floor(Math.random() * keys.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selected.push(symbolDictionary[keys[index]]);
    }
  }
  return selected;
};

// Metinden sayıları çıkar
export const extractNumbers = (text) => {
  const numbers = text.match(/\d+/g);
  if (!numbers) return null;
  return numbers.map(n => parseInt(n, 10));
};

// Sayı anlamını getir
export const getNumberMeaning = (num) => {
  // Direkt eşleşme
  if (numberDictionary[num]) {
    return { number: num, meaning: numberDictionary[num].meaning };
  }
  
  // Basamak toplamı (numeroloji)
  let digitSum = num;
  while (digitSum > 9 && !numberDictionary[digitSum]) {
    digitSum = String(digitSum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  
  if (numberDictionary[digitSum]) {
    return { 
      number: num, 
      reducedTo: digitSum, 
      meaning: numberDictionary[digitSum].meaning 
    };
  }
  
  return { number: num, meaning: "gizli bir ritim taşıyor" };
};

// Kelimeyi hecelere böl (basit Türkçe hecelem)
export const splitToSyllables = (word) => {
  // Basit hece bölme - Türkçe kurallarına yakın
  const vowels = 'aeıioöuüAEIİOÖUÜ';
  const syllables = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    if (vowels.includes(word[i])) {
      // Sonraki harf ünsüz ve ondan sonra sesli varsa, ünsüzü sonraki heceye at
      if (i + 2 < word.length && !vowels.includes(word[i + 1]) && vowels.includes(word[i + 2])) {
        syllables.push(current);
        current = '';
      } else if (i + 1 < word.length && !vowels.includes(word[i + 1])) {
        current += word[i + 1];
        i++;
        syllables.push(current);
        current = '';
      } else if (i === word.length - 1) {
        syllables.push(current);
        current = '';
      }
    }
  }
  
  if (current) syllables.push(current);
  
  // En fazla 3 parça döndür
  if (syllables.length <= 3) return syllables;
  
  // 3'ten fazlaysa birleştir
  const result = [];
  const chunkSize = Math.ceil(syllables.length / 3);
  for (let i = 0; i < syllables.length; i += chunkSize) {
    result.push(syllables.slice(i, i + chunkSize).join(''));
  }
  return result.slice(0, 3);
};

// Hece için sembolik anlam üret
export const getSyllableMeaning = (syllable) => {
  const syllableMeanings = {
    // Sesli harflerle başlayanlar
    'a': 'açılış, başlangıç',
    'e': 'hareket, enerji',
    'i': 'iç, içsel',
    'o': 'bütünlük, döngü',
    'u': 'derinlik, uzaklık',
    'ö': 'dönüşüm, öz',
    'ü': 'yükseliş, üst',
    'ı': 'sessizlik, bekleyiş',
    
    // Yaygın heceler
    'an': 'an, şimdi',
    'en': 'en, doruk',
    'in': 'içinde, derinlikte',
    'on': 'onay, kabul',
    'un': 'unutuş, kayıp',
    'ar': 'arayış, ar',
    'er': 'erişim, erkek',
    'ir': 'ulaşma',
    'or': 'oluş',
    'ur': 'uyanış',
    'al': 'alma, kabul',
    'el': 'el, eylem',
    'il': 'ilk, başlangıç',
    'ol': 'oluş, varoluş',
    'ul': 'ulaşma',
    'ak': 'akış, beyazlık',
    'ek': 'ekleme, bağ',
    'ik': 'küçük, öz',
    'ok': 'hedef, yön',
    'uk': 'kapalılık',
    'aş': 'aşma, geçiş',
    'eş': 'eşlik, ikiz',
    'iş': 'iş, eylem',
    'oş': 'hoşluk',
    'uş': 'uçuş, özgürlük',
    'at': 'atılım, hareket',
    'et': 'etki, iz',
    'it': 'itme, güç',
    'ot': 'ot, doğa',
    'ut': 'tutma',
    'ay': 'ışık, aydınlık',
    'ey': 'çağrı',
    'oy': 'oyun, seçim',
    'uy': 'uyum',
    'can': 'hayat, ruh',
    'dan': 'kaynak',
    'den': 'derinlik',
    'gün': 'ışık, zaman',
    'göz': 'görüş, bakış',
    'kalp': 'merkez, sevgi',
    'yol': 'süreç, yön',
    'su': 'akış, duygu',
    'taş': 'kalıcılık, sertlik',
    'ses': 'ifade, çağrı',
  };
  
  const lower = syllable.toLowerCase();
  
  // Direkt eşleşme
  if (syllableMeanings[lower]) {
    return syllableMeanings[lower];
  }
  
  // İlk harfe göre
  const firstChar = lower[0];
  const charMeanings = {
    'a': 'açılış enerjisi',
    'b': 'başlangıç, bağ',
    'c': 'canlılık',
    'ç': 'çoğalma',
    'd': 'dayanak, destek',
    'e': 'eşik, enerji',
    'f': 'farkındalık',
    'g': 'geçiş, güç',
    'ğ': 'yumuşama',
    'h': 'hareket, hava',
    'i': 'iç yolculuk',
    'j': 'jest, ifade',
    'k': 'karar, kapı',
    'l': 'aşk, bağ',
    'm': 'anne, kaynak',
    'n': 'nefes, an',
    'o': 'odak, merkez',
    'ö': 'öz, dönüşüm',
    'p': 'potansiyel',
    'r': 'ritim, döngü',
    's': 'sessizlik, sır',
    'ş': 'şifa, akış',
    't': 'tohum, temel',
    'u': 'uzaklık, derinlik',
    'ü': 'üst, yükseliş',
    'v': 'varoluş',
    'y': 'yenilik, yön',
    'z': 'zaman, iz',
  };
  
  return charMeanings[firstChar] || 'gizli anlam';
};

// Yansıma metinleri
export const reflectionTemplates = [
  "Bu soru, içerideki bir kapıyı tıklatıyor. Kapının arkasında ne olduğunu yalnızca sen bilebilirsin.",
  "Sorduğun şey, aslında çoktan bildiğin bir şeyin yüzeyine çıkmak istemesi olabilir.",
  "Bu kelimeler bir ayna tutuyor. Yansıyan, sorunun kendisi değil — soranın kendisi.",
  "Zihin soru sorar; kalp dinler. Arada kalan sessizlik, cevabın ta kendisi olabilir.",
  "Bir tohum toprağa düştüğünde 'neden' diye sormaz. Sadece açılır. Bu soru da öyle açılmak istiyor olabilir.",
  "Soru, cevabın gölgesidir. Gölgeyi takip etmek bazen ışığa götürür, bazen daha derin karanlığa.",
  "Bu an, bir eşikte duruyorsun. Eşikler cevap vermez; geçilmeyi bekler.",
  "Sorular nehir gibidir — kaynağını değil, denize ulaşmayı ararlar.",
  "İçindeki bir şey bu soruyu sormak için yıllardır bekliyordu belki de.",
  "Bu soru, hafızanın katlanmış bir köşesinden geliyor. Orada ne saklı?",
];

// Hikaye tohumu şablonları
export const storySeeds = [
  "Bir zamanlar, soruların cevaplardan daha kıymetli olduğu bir diyar varmış. Orada yaşayanlar, her sabah gökyüzüne tek bir soru fısıldarmış.",
  "Gecenin en karanlık anında, bir yolcu durmuş ve 'Işığı aramayı bıraksam, belki ışık beni bulur' demiş.",
  "Dağın zirvesinde yaşlı bir kadın oturuyormuş. Gelen herkese aynı şeyi söylüyormuş: 'Cevap, soruyu sormayı bıraktığında gelir.'",
  "Bir nehir varmış, tersine akarmış. Onu takip edenler kaynağa değil, kendi başlangıçlarına ulaşırmış.",
  "Masallarda kaybolmak için ormanın derinliklerine gidilir. Gerçek kaybolma ise, kendi hikâyenin ortasında başlar.",
  "Aynaya bakan çocuk, yansımasının gülümsemediğini fark etmiş. O gün, iki kişi olduğunu anlamış.",
  "Rüyada bir kapı gördüm. Açtığımda arkasında başka bir kapı vardı. Uyandığımda anladım: her cevap yeni bir soru.",
  "Tohum toprağa 'Nereye gidiyorum?' diye sormamış. Sadece kök salmış. Yön, hareketten sonra gelir.",
  "Eski bir haritada yazıyormuş: 'Aradığın yer, haritanın dışında.' Belki de sen haritanın dışına çıkmaya hazırsın.",
  "Bir kuş, göç yolunu unutmuş. Ama kanatları unutmamış. Bazen bilmek değil, güvenmek yeterli.",
];

// İdrak soruları
export const awarenessQuestions = [
  "Bu soruyu sorduğunda içinde ne uyandı?",
  "Eğer cevabı zaten bilseydin, ne değişirdi?",
  "Bu soru kimin sesi — senin mi, yoksa sana öğretilen birinin mi?",
  "Sorunun arkasındaki gerçek soru ne?",
  "Cevabı aldığında ne hissedeceksin — rahatlama mı, hayal kırıklığı mı?",
  "Bu soruyu beş yıl önce sorsan, farklı mı olurdu?",
  "Bedende bu soru nerede duruyor?",
  "Cevap yerine sessizlik gelse, ne olurdu?",
  "Bu soruyu sana kim öğretti?",
  "Cevabı bilmemek seni ne kadar rahatsız ediyor?",
  "Bu soru, neyi görmekten kaçınmana yardımcı oluyor?",
  "Sormadan önce ne hissediyordun?",
  "Bu soru bir kapı olsaydı, arkasında ne olurdu?",
  "Cevap değil de bir renk gelse, hangi renk olurdu?",
  "Bu sorunun sahibi kim — korku mu, merak mı, umut mu?",
];

// Rastgele seç
export const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
