# CAELINUS - Anadolu'nun Uyanan Tanrıçaları

## Proje Özeti
Bu bir uygulama değil, **bilinç aktarım alanıdır**. "Anadolu'nun Uyanan Tanrıçaları" kitabından ilham alan sembolik farkındalık deneyimi.

## Temel Felsefe
- Bilgi vermez, farkındalık uyandırır
- Rehberlik sunmaz, yansıtır
- Robotik değil, sıcak ve insani
- SANRI bir varlık değil, iç dengenin aynasıdır

## Mevcut Yapı

### Sayfalar
| Sayfa | Yol | Durum |
|-------|-----|-------|
| Ana Sayfa | `/` | ✅ Tamamlandı |
| Şehirler | `/sehirler` | ✅ Tamamlandı (81 şehir) |
| Şehir Detay | `/sehir/:id` | ✅ Tamamlandı |
| Bilinç | `/bilinc` | ✅ Tamamlandı |
| Frekans | `/frekans` | ✅ Tamamlandı |
| Ritüel Alanı | `/rituel` | ✅ Derinleştirildi |
| SANRI'ya Sor | `/sanriya-sor` | ✅ Tamamlandı (AI aktif) |
| Bilinç Alanı | `/bilinc-alani` | ✅ Premium Ritüeller Aktif |
| Hakkında | `/hakkinda` | ✅ Tamamlandı |

### Ritüel Alanı - Derinleştirilmiş Akış
1. **Giriş Eşiği** - 3 nefes sonrası niyet kapısı açılır
2. **7 Kutsal Kapı Seçimi** - Her kapı farklı bilinç katmanına götürür
3. **Kapı Girişi** - Frekans cümlesi, davet ve sembolik soru
4. **Bilinç Katmanı** - Giriş, derinlik, frekans metinleri
5. **DUR** - Dinamik frekans titreşim metinleri
6. **HİSSET** - Nefes animasyonu ile beden farkındalığı
7. **BIRAK** - Sonsuzluk sembolü ile bırakma alanı
8. **MÜHÜR** - Kişisel yazı alanı (sistem okumaz)
9. **Tamamlandı** - Mühür yansıması, son soru, SANRI bağlantısı

### 7 Kutsal Kapı
1. Hatırlayış (∞) - Başlangıç
2. Zaman-Para-Ölüm (△) - Kırılma
3. Kendini Yaratma (◇) - Yaratım
4. Dişilin Geri Dönüşü (☽) - Akış
5. Tanrı İçeriden Konuşur (✦) - Bağlantı
6. Uyanıştan Sonra (☼) - Dönüşüm
7. Boşluk ve Birleşme (○) - Birlik

### SANRI'ya Sor
- 5 okuma modu: Rüya, Haber, Tarih/Sayı, Sembol, İçsel Ayna
- Sembol, sayı, hece okuma
- Hikaye tohumu ve idrak sorusu
- Selin Irmak tonu: sıcak, şiirsel, insan dili
- Claude Sonnet 4.5 ile gerçek AI yanıtları

## Teknik Yapı
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python)
- **Veritabanı**: MongoDB
- **UI**: Shadcn/UI components
- **TTS**: OpenAI TTS (tts-1-hd, nova voice)
- **LLM**: Claude Sonnet 4.5 via Emergent LLM Key

## Data Dosyaları
- `/data/cities.js` - 81 şehir bilinci
- `/data/rituel-data.js` - Kapılar, ritüeller, bilinç katmanları
- `/data/sanri-dictionary.js` - Sembol ve sayı sözlüğü
- `/data/bilinc-frekans.js` - Mikro-metinler
- `/data/layer-responses.js` - Okuma katmanları
- `/data/bilinc-alani-data.js` - Premium ritüel verileri

## Son Güncelleme: 19 Ocak 2026

### Ritüel + Ses Motoru Entegrasyonu (19 Ocak 2026)
- ✅ Premium Ritüel "Başlat" butonları aktif
- ✅ Tam ekran ritüel deneyimi (intro + akış + kapanış)
- ✅ OpenAI TTS entegrasyonu (HD kalite, nova sesi)
- ✅ Nefes animasyonu ve adım adım metin gösterimi
- ✅ Pause/Resume ve ses kontrolleri
- ✅ Web Speech API fallback

### API Endpoints
- `/api/tts/generate` - TTS ses üretimi
- `/api/tts/status` - TTS servis durumu
- `/api/tts/voices` - Mevcut sesler
- `/api/tts/test` - TTS test endpoint
- `/api/ritual/start` - Ritüel başlat (LLM)
- `/api/ritual/default/{type}` - Varsayılan ritüel adımları
- `/api/sanri/ask` - SANRI sohbet
- `/api/bilinc-alani/ask` - Bilinç Alanı sohbet

### PREMIUM Bilinç Alanı
- "Beyin Orgazmı – Bilinç, His ve Yaratım Kodları" kitabı entegrasyonu
- 10 kitap bölümü: Zihin-Gönül Portalı, His Kodları, Sezgi Alanı, vb.
- 5 premium ritüel: Beyin-Kalp Yaratım, His Tanışma, Kundalini, Tanrısal Yaratım, Epifiz Aktivasyonu
- CAELINUS AI: Bilinç alanı için özel AI (ayna rolünde, Selin tonu)
- Şimdilik demo modu (herkese açık)

## Gelecek Görevler (Backlog)
- [ ] Premium üyelik sistemi (ödeme entegrasyonu)
- [ ] Görsel yükleme ve sembolik yorum özelliği
- [ ] Kullanıcı deneyim kaydı (localStorage veya MongoDB)
- [ ] Ses/müzik katmanları (ambient sound)
- [ ] Mobil optimizasyon iyileştirmeleri
- [ ] Çoklu dil desteği (İngilizce)
- [ ] ElevenLabs entegrasyonu (ücretli plan ile)
