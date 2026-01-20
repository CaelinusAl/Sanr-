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
| Bilinç Alanı | `/bilinc-alani` | ✅ **API Entegrasyonu Tamamlandı** |
| Hakkında | `/hakkinda` | ✅ Tamamlandı |
| **Admin Panel** | `/admin` | ✅ **Tamamlandı** |

## Admin Panel - Tapınak Sistemi

**Giriş:** `/admin` → Şifre: `caelinus2026`

**Tamamlanan Özellikler:**
- ✅ Dashboard (istatistikler, sistem durumu, aktivite logu)
- ✅ Ritüel Builder (CRUD, publish/unpublish)
- ✅ Admin'den oluşturulan ritüeller frontend'de görünür
- ✅ Yayınlanan ritüeller anında Bilinç Alanı > Premium Ritüeller'de listelenir
- ✅ Unpublish edilen ritüeller listeden kaldırılır

**Sol Menü Yapısı:**
- **Kontrol**: Dashboard
- **İçerik Tapınağı**: Ritüel Builder, Kitap Bölümleri, Bilinç Kartları, Frekans Kartları, Medya Kütüphanesi
- **Motor Tapınağı**: SANRI Prompt Studio, TTS Ayarları
- **Kollektif Tapınağı**: Kullanıcılar, Moderasyon, Analitik
- **Sistem**: Ayarlar

## Ritüel Sistemi

### Admin'den Frontend'e Akış
1. Admin Panel'de ritüel oluştur (`/admin/rituals/new`)
2. Adımları ekle (phase, metin, süre)
3. "Yayınla" butonuna bas
4. Ritüel otomatik olarak Bilinç Alanı > Premium Ritüeller'de görünür
5. Kullanıcı "Başlat" tıklayınca ritüel akışı başlar

### Ritüel Akışı
1. **Intro Ekranı**: Başlık, süre, adım sayısı, hazırlık cümlesi
2. **"Başla" Butonu**: Akışı başlatır
3. **Adım Adım Gösterim**: Phase göstergesi, metin, nefes animasyonu
4. **Sesli Okuma**: OpenAI TTS (HD kalite, nova sesi)
5. **Kontroller**: Pause/Resume, Ses açma/kapama
6. **Kapanış**: "Tamamlandı" mesajı, tekrar başlatma seçeneği

### Premium Gating
- Demo Modu: `REACT_APP_DEMO_PREMIUM=true` (herkese açık)
- Premium ritüellere tıklandığında modal gösterilir (premium değilse)
- Gerçek premium kontrolü için auth sistemi gerekli

## Mevcut Yayınlanan Ritüeller
1. **Beyin-Kalp Yaratım Titreşimi** - 12 dk, 11 adım
2. **His ile Tanışma Ritüeli** - 8 dk, 9 adım

## Teknik Yapı
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python)
- **Veritabanı**: MongoDB
- **UI**: Shadcn/UI components
- **TTS**: OpenAI TTS (tts-1-hd, nova voice)
- **LLM**: Claude Sonnet 4.5 via Emergent LLM Key

## API Endpoints

### Admin API
- `POST /api/admin/login` - Giriş
- `GET /api/admin/verify` - Token doğrulama
- `GET /api/admin/dashboard/stats` - İstatistikler
- `GET/POST /api/admin/rituals` - Ritüel listele/oluştur
- `GET/PUT/DELETE /api/admin/rituals/:id` - Ritüel detay/güncelle/sil
- `POST /api/admin/rituals/:id/publish` - Yayınla
- `POST /api/admin/rituals/:id/unpublish` - Yayından kaldır
- `GET /api/admin/public/rituals` - Frontend için yayınlanan ritüeller

### TTS API
- `POST /api/tts/generate` - Ses üret (voice_profile: sanri/book/custom)
- `POST /api/tts/ritual/play` - SANRI VOICE ile ritüel seslendir
- `POST /api/tts/book/play` - BOOK VOICE ile kitap seslendir
- `GET /api/tts/profiles` - Ses profili detayları
- `GET /api/tts/voices` - Mevcut sesler ve modeller
- `GET /api/tts/status` - TTS durumu

### SANRI API
- `POST /api/sanri/ask` - Soru sor

## Gelecek Görevler (Backlog)

### P0 - Yüksek Öncelik
- [x] SANRI VOICE sistemi (20 Ocak 2026) ✅
- [ ] GÖRSELİN Frontend Entegrasyonu (Hologram Üret butonu → API bağlantısı)
- [ ] Watermark toggle (premium kullanıcılar için)
- [ ] Görsel Analiz (Image → API upload)

### P1 - Orta Öncelik  
- [ ] Kitap Bölümleri editörü + BOOK VOICE entegrasyonu
- [ ] SANRI Prompt Studio (versiyonlama)
- [ ] Premium üyelik sistemi (ödeme entegrasyonu)
- [ ] TTS Ayarları sayfası

### P2 - Düşük Öncelik
- [ ] Görsel yükleme ve sembolik yorum
- [ ] Kullanıcı deneyim kaydı
- [ ] Ses/müzik katmanları (ambient sound)
- [ ] Mobil optimizasyon
- [ ] Çoklu dil desteği (İngilizce)

## Android Build & Google Play Deployment

### Tamamlanan (19 Ocak 2026)
- ✅ Capacitor 6 entegrasyonu (com.caelinus.ai)
- ✅ AndroidManifest.xml - App Links & Deep Links yapılandırması
- ✅ Release keystore oluşturuldu (release.keystore)
- ✅ SHA256 Fingerprint: `F6:3F:43:26:66:23:A1:0E:D7:08:09:C7:06:10:40:A2:2E:D6:9C:32:C5:56:9C:61:52:EB:B8:4D:2E:E2:4F:35`
- ✅ assetlinks.json hazırlandı (.well-known/assetlinks.json)
- ✅ gradle.properties signing config eklendi
- ✅ Build script (build-android.sh)
- ✅ ANDROID_BUILD_GUIDE.md detaylı dokümantasyon

### Android Build Bilgileri
| Özellik | Değer |
|---------|-------|
| Package Name | com.caelinus.ai |
| Version | 1.0.0 |
| Min SDK | 22 (Android 5.1) |
| Target SDK | 34 (Android 14) |
| Keystore Alias | caelinus |
| Keystore Password | Caelinus2026Secure! |

### Google Play Yükleme İçin Gereken
- [ ] App Icon (512x512)
- [ ] Feature Graphic (1024x500)
- [ ] Screenshots (min 2)
- [ ] Privacy Policy URL
- [ ] Local makinede AAB build

## Son Güncelleme: 20 Ocak 2026

### P0 Completion - GÖRSELİN Module (DONE) ✅
**20 Ocak 2026**

**Tamamlanan:**
- ✅ Image Analysis API düzeltildi (ImageContent class)
- ✅ Response schema: `{ok, analysis_text, meta, seen, symbolic, questions, ritual}`
- ✅ Error schema: `{ok: false, error: {code, message}, request_id}`
- ✅ Loading progress: "Görsel okunuyor… semboller ayrıştırılıyor… Sanrı yorumluyor…"
- ✅ Error state: "Yorum gelmedi" + Retry butonu
- ✅ Hologram generation çalışıyor
- ✅ Watermark toggle (premium vs free)

**Test Sonuçları:**
- Backend: 92% (12/13 tests passed)
- Frontend: 100% working

**Response Schema:**
```json
// Success
{ok: true, analysis_text, seen, symbolic, questions[], ritual, meta: {model, latency_ms, request_id}}

// Error
{ok: false, error: {code, message}, request_id}
```
**20 Ocak 2026**

**Tamamlanan:**
- Sign in with Apple butonu eklendi (iOS App Store gereksinimi)
- Gizlilik Politikası sayfası oluşturuldu (/gizlilik, /privacy)
- KVKK/GDPR uyumlu içerik (TR/EN)
- Store Release Plan dokümanı (/app/STORE_RELEASE_PLAN.md)

**Minimum Store-Ready Kriterleri (P0):**
| Özellik | Durum |
|---------|-------|
| Sign in with Apple | ✅ DONE |
| Privacy Policy Page | ✅ DONE |
| Account Deletion | ✅ DONE |
| Data Export | ✅ DONE |
| GÖRSELİN Hologram API | ⏳ TODO |
| GÖRSELİN Watermark Toggle | ⏳ TODO |
| GÖRSELİN Image Analysis | ⏳ TODO |
| Loading States Polish | ⏳ TODO |

**Store Assets Gerekli:**
- App Icon (512x512 Android, 1024x1024 iOS)
- Feature Graphic (1024x500)
- Screenshots (8 ekran, TR/EN)
- Store Descriptions (TR/EN)
**20 Ocak 2026**

Kapsamlı kullanıcı sistemi:

**Authentication:**
- Google OAuth (Emergent Auth) - Hızlı onboarding için öncelikli
- Email/Password - Premium ve admin kullanıcılar için
- Session yönetimi: httpOnly cookie, 7 gün expiry
- Password hashing: SHA256 with salt

**Bilinç Profili (Onboarding):**
4 sorulu bilinç profili:
1. "Bu alana neden geldin?" (dreams, self_discovery, turning_point, curiosity)
2. "Şu an hayatında en baskın duygu ne?" (seeking, confused, calm, tired, curious, love)
3. "SANRI seninle nasıl konuşsun?" (soft, wise, direct, symbolic)
4. "Bu alanı hangi amaçla kullanacaksın?" (dreams, rituals, frequencies, self_knowledge, all)

**SANRI Kişiselleştirme:**
- Dinamik context builder (build_sanri_context)
- Her kullanıcı için farklı SANRI deneyimi
- Context DB'de saklanmaz, istekte oluşturulur

**Admin Kullanıcı Yönetimi:**
- `/admin/users` - Dashboard analytics + kullanıcı listesi
- Premium yönetimi (manuel atama)
- Kullanıcı silme / anonimleştirme (KVKK/GDPR)

**Privacy (KVKK/GDPR):**
- `/api/user/export` - Veri export
- `/api/user/delete` - Hesap silme
- `/api/admin/users/{id}/anonymize` - Anonimleştirme
- Onboarding'de consent checkbox

**Auth Endpoints:**
- `POST /api/auth/google/session` - Google OAuth
- `POST /api/auth/email/register` - Email kayıt
- `POST /api/auth/email/login` - Email giriş
- `GET /api/auth/me` - Current user
- `POST /api/auth/onboarding` - Bilinç profili
- `GET /api/auth/sanri-context` - SANRI context
- `GET /api/auth/sanri-welcome` - Karşılama mesajı
- `POST /api/auth/logout` - Çıkış
CAELINUS AI'nin ses kimliğinin temel parçası. İki farklı ses profili:

**SANRI_VOICE (Ritüel Rehberi):**
- Ses: OpenAI `nova` voice
- Model: `tts-1-hd` (yüksek kalite)
- Hız: `0.78x` (çok yavaş, hipnotik etki için)
- Karakter: Kadın sesi, yumuşak, sakin, derin, güven veren
- Amaç: Kullanıcının zihnini yavaşlatan, güven veren, içe döndüren ses
- Kullanım: Premium ritüeller, bilinç deneyimleri, hipnotik rehberlik

**CAELINUS_BOOK_VOICE (Anlatıcı):**
- Ses: OpenAI `shimmer` voice  
- Model: `tts-1-hd`
- Hız: `0.85x` (yine yavaş ama daha akıcı)
- Karakter: Nötr, akıcı, sıcak anlatıcı tonu
- Amaç: Uzun dinlemelerde yormayan, kitap okumalarına uygun
- Kullanım: Kitap bölümleri, meditasyonlar, anlatım içerikleri

**API Endpoints:**
- `POST /api/tts/ritual/play` - SANRI VOICE ile ritüel seslendir
- `POST /api/tts/book/play` - BOOK VOICE ile kitap seslendir  
- `POST /api/tts/generate` - voice_profile parametreli genel TTS
- `GET /api/tts/profiles` - Ses profili detayları
- `GET /api/tts/status` - Servis durumu ve profil bilgileri

**RitualPlayer Bileşeni:**
- Premium ritüel seçildiğinde açılan immersive modal
- Play butonu `/api/tts/ritual/play` çağırır
- Wave animasyonu (loading/playing durumları)
- Kontroller: play/pause, ses, restart, metin göster
- Progress bar ile süre takibi
- "SANRI VOICE" badge'i

### GÖRSELİN Modülü (YENİ) ✅
CAELINUS AI'ın ana imza özelliklerinden biri:

**Hologram Üret (Text → Image):**
- OpenAI GPT Image 1 entegrasyonu (Emergent LLM Key)
- 6 kutsal preset stil:
  - 🌙 Moon Jellyfish – Bilinç Işığı
  - 🏛 Temple Water – Bilinç Tapınağı
  - 🪞 Hologram Mirror – İçsel Yansıma
  - 👁 Tanrıça Silüeti – İlahi Hatırlayış
  - 🔺 Kutsal Geometri – Frekans Haritası
  - 🖤 Black Gold – İlahi Zarafet (Premium)
- Aspect ratio seçimi (1:1, 4:5, 9:16, 16:9)
- Premium: 4 görsel batch, günlük 20 üretim

**Görsel Yorumla (Image → Analysis):**
- Claude Sonnet 4.5 ile sembolik okuma
- 4 blok: Gördüğüm, Sembolik Okuma, Yansıma Soruları, Mini Ritüel
- Premium: derin analiz + Frekans Kartı export

**Admin Panel:**
- Visual Preset Manager (CRUD)
- Analytics: üretim/analiz sayıları

**API Endpoints:**
- POST /api/visual/generate
- POST /api/visual/analyze
- GET /api/visual/presets
- Admin CRUD endpoints

### Yeni Ana Sayfa Tasarımı (Tapınak Deneyimi)
- ✅ Splash Screen + Home Page
- ✅ 6 kutsal alan kartı (Bilinç, Frekans, Sanrı, GÖRSELİN, Ritüel, Profil)
- ✅ TR | EN dil desteği
- ✅ Responsive tasarım
