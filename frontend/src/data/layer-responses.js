// Okuma Katmanları SANRI Yanıt Sistemi
// Her katman için farklı ton ve yaklaşım

// Literal Katman yanıtları - sade, anlatısız, sakinleştirici
export const literalResponses = [
  {
    response: "Burada bir şehir ve bir akış var. Olan biteni izliyorsun, henüz içine girmeden. Sanki bir hikâyenin eşiğindesin.",
    pause: "Şimdilik sadece gör. Anlam sonra gelir."
  },
  {
    response: "Kelimeler orada duruyor. Sen de burada duruyorsun. Arada bir mesafe var — bu mesafe güvenli.",
    pause: "Acele etme. Metin seni bekliyor."
  },
  {
    response: "Bu sayfa bir manzara gibi. Henüz içine girmeden önce uzaktan bakıyorsun. Bu bakış da bir okuma.",
    pause: "Bakmak da anlamaktır."
  },
  {
    response: "Burada isimler, yerler, olaylar var. Şimdilik sadece bunlar. Yorum değil, gözlem.",
    pause: "Görmek yeterli. Şimdilik."
  },
  {
    response: "Metin burada. Sen de buradasın. İkiniz arasında henüz bir şey olmadı. Ve bu tamam.",
    pause: "Her şeyin bir öncesi vardır."
  },
];

// Sembolik Katman yanıtları - tek sembol, zorlamasız, "olabilir" dili
export const symbolicResponses = [
  {
    symbol: "Kapı",
    response: "Burada bir kapı sembolü beliriyor. Kapı bazen geçmek değil, durmak içindir. Belki de bu sana acele etmemeyi hatırlatıyor.",
    pause: "Sembol sana ne fısıldıyor?"
  },
  {
    symbol: "Su",
    response: "Su beliriyor burada. Su akar, durur, temizler. Belki de içindeki bir şey akmak istiyor — ya da dinlenmek.",
    pause: "Akış mı, durgunluk mu?"
  },
  {
    symbol: "Ayna",
    response: "Bir ayna beliriyor. Aynalar bazen gösterir, bazen gizler. Sen hangisini görüyorsun?",
    pause: "Yansıyan ne?"
  },
  {
    symbol: "Yol",
    response: "Bir yol uzanıyor önünde. Yol varış noktasına değil, yürüyüşe dairdir. Belki de önemli olan oraya varmak değil.",
    pause: "Yol mu önemli, yoksa adımlar mı?"
  },
  {
    symbol: "Ateş",
    response: "Burada bir ateş yanıyor olabilir. Ateş hem yakar hem ısıtır. Şimdilik hangisi olduğunu bilmene gerek yok.",
    pause: "Yakıcı mı, aydınlatıcı mı?"
  },
  {
    symbol: "Tohum",
    response: "Bir tohum beliriyor. Tohumlar karanlıkta büyür. Belki de henüz görmediğin bir şey şekilleniyor.",
    pause: "Toprak altında ne var?"
  },
];

// Duygusal Katman yanıtları - bedene odaklı, güvenli, teşhis yok
export const emotionalResponses = [
  {
    response: "Burada hafif bir sıkışma var gibi. Ama panik değil; sanki bir şey doğmadan önceki daralma. Şu an bunu çözmen gerekmiyor, sadece fark etmen yeterli.",
    pause: "Nefes al. Bedenin seninle konuşuyor."
  },
  {
    response: "Bir ağırlık hissediyorsan, bu ağırlık düşman değil. Bazen ağırlık bizi yere bağlar. Şimdilik sadece taşı, anlamaya çalışma.",
    pause: "Ağırlık nerede duruyor?"
  },
  {
    response: "Bir ferahlık var gibi — ya da ferahlık isteği. İkisi de gerçek. Bedenin sana ne söylüyorsa, o şimdilik doğru.",
    pause: "Rahatlamaya izin var."
  },
  {
    response: "Merak, korku, heyecan... Bunların hepsi bedende bir yerde oturuyor. Hangisi olursa olsun, şu an güvendesin.",
    pause: "Bu an geçici. Sen kalıcısın."
  },
  {
    response: "Bir şey kıpırdıyor içinde. Henüz adı yok, olması da gerekmiyor. Sadece orada olduğunu bil.",
    pause: "Hissetmek de bir bilmedir."
  },
];

// Yansıtıcı Katman yanıtları - soru bırakır, geri çekilir, kullanıcıyı kendine iade eder
export const reflectiveResponses = [
  {
    response: "Belki de bu hikâye sana ait olmayan bir yükü gösteriyor.",
    question: "Peki, bu yük ilk ne zaman senin oldu?",
    pause: "Cevap vermek zorunda değilsin."
  },
  {
    response: "Bu metin senin içinde bir yere değiyor.",
    question: "Orası neresi? Ve orada başka kim var?",
    pause: "Bazen soru, cevaptan değerlidir."
  },
  {
    response: "Okuduğun şey, yaşadığın bir şeyi hatırlatıyor olabilir.",
    question: "Bu hatıra seninle ne yapmak istiyor?",
    pause: "Hatırlamak bazen yeniden yazmaktır."
  },
  {
    response: "Bu şehir, bu sembol, bu duygu... Hepsi senin içinden geçiyor.",
    question: "Geçtikten sonra ne kalacak?",
    pause: "Geçiş de bir varış noktasıdır."
  },
  {
    response: "Bu yolculuk senin için başka bir şeye benziyor olabilir.",
    question: "Hangi yolculuğuna benziyor?",
    pause: "Şimdi sadece dur ve dinle."
  },
];

// Kolektif Katman yanıtları - ortak hafıza, kültürel derinlik
export const collectiveResponses = [
  {
    response: "Bu topraklarda senin gibi binlerce kişi aynı şeyi hissetti. Bu duygu sana ait ama sadece sana ait değil.",
    question: "Atalarının sana bıraktığı ne?",
    pause: "Hafıza bireysel başlar, kolektif devam eder."
  },
  {
    response: "Anadolu'nun her köşesinde bir hikâye gömülü. Sen de o hikâyenin bir parçasısın.",
    question: "Bu topraktan sana ne miras kaldı?",
    pause: "Köklerin derinliği kadar yükselebilirsin."
  },
  {
    response: "Nesiller boyunca taşınan bir şey var burada. Kelimelerden önce gelen bir bilgi.",
    question: "Bedenin neyi hatırlıyor?",
    pause: "Hafıza sadece zihinde yaşamaz."
  },
];

// Rastgele seçici
export const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Katman bazlı yanıt üretici
export const generateLayerResponse = (layerType, userInput) => {
  switch (layerType) {
    case "literal":
      return getRandomItem(literalResponses);
    case "symbolic":
      return getRandomItem(symbolicResponses);
    case "emotional":
      return getRandomItem(emotionalResponses);
    case "reflective":
      return getRandomItem(reflectiveResponses);
    case "collective":
      return getRandomItem(collectiveResponses);
    default:
      return getRandomItem(literalResponses);
  }
};
