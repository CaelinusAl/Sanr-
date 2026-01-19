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
- `POST /api/tts/generate` - Ses üret
- `GET /api/tts/status` - TTS durumu

### SANRI API
- `POST /api/sanri/ask` - Soru sor

## Gelecek Görevler (Backlog)

### P0 - Yüksek Öncelik
- [ ] Kitap Bölümleri editörü (admin)
- [ ] SANRI Prompt Studio (versiyonlama)
- [ ] Bilinç/Frekans Kartları editörleri

### P1 - Orta Öncelik
- [ ] Premium üyelik sistemi (ödeme entegrasyonu)
- [ ] TTS Ayarları sayfası
- [ ] Kullanıcı yönetimi

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

## Son Güncelleme: 19 Ocak 2026
- Android deployment pipeline tamamlandı
- Keystore ve signing config hazır
- assetlinks.json domain doğrulama için hazır
- Build script ve detaylı dokümantasyon oluşturuldu
