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
| **Admin Panel** | `/admin` | ✅ **YENİ** |

### Admin Panel - Tapınak Sistemi (19 Ocak 2026)

**Giriş:** `/admin` → Şifre: `caelinus2026`

**Sol Menü Yapısı:**
- **Kontrol**: Dashboard
- **İçerik Tapınağı**: Ritüel Builder, Kitap Bölümleri, Bilinç Kartları, Frekans Kartları, Medya Kütüphanesi
- **Motor Tapınağı**: SANRI Prompt Studio, TTS Ayarları
- **Kollektif Tapınağı**: Kullanıcılar, Moderasyon, Analitik
- **Sistem**: Ayarlar

**Dashboard Özellikleri:**
- İçerik istatistikleri (ritüeller, bölümler, kartlar)
- Sistem durumu (TTS, SANRI, DB)
- Son aktiviteler (audit log)
- Hızlı aksiyonlar

**Ritüel Builder:**
- Ritüel listesi (Tümü/Taslak/Yayında filtreleri)
- Yeni ritüel oluşturma formu
- Adım adım akış editörü (sürükle-bırak)
- Phase seçimi (açılış, nefes, ana, kapanış)
- TTS toggle
- Etiket sistemi
- Kaydet/Yayınla butonları

**API Endpoints:**
- `/api/admin/login` - Giriş
- `/api/admin/verify` - Token doğrulama
- `/api/admin/dashboard/stats` - İstatistikler
- `/api/admin/rituals` - CRUD
- `/api/admin/rituals/:id/publish` - Yayınla
- `/api/admin/chapters` - Bölümler CRUD
- `/api/admin/bilinc-cards` - Bilinç kartları CRUD
- `/api/admin/frekans-cards` - Frekans kartları CRUD
- `/api/admin/sanri-prompts` - Prompt CRUD
- `/api/admin/audit-logs` - Aktivite logları
- `/api/admin/settings` - Ayarlar
- `/api/admin/public/rituals` - Frontend için yayınlanan ritüeller

### Ritüel + Ses Motoru (19 Ocak 2026)
- ✅ Premium Ritüel "Başlat" butonları aktif
- ✅ Tam ekran ritüel deneyimi (intro + akış + kapanış)
- ✅ OpenAI TTS entegrasyonu (HD kalite, nova sesi)
- ✅ Nefes animasyonu ve adım adım metin gösterimi
- ✅ Pause/Resume ve ses kontrolleri
- ✅ Web Speech API fallback

## Teknik Yapı
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python)
- **Veritabanı**: MongoDB
- **UI**: Shadcn/UI components
- **TTS**: OpenAI TTS (tts-1-hd, nova voice)
- **LLM**: Claude Sonnet 4.5 via Emergent LLM Key

## Gelecek Görevler (Backlog)

### P0 - Yüksek Öncelik
- [ ] Kitap Bölümleri editörü (admin)
- [ ] Bilinç Kartları editörü (admin)
- [ ] SANRI Prompt Studio (versiyonlama)
- [ ] Admin'den oluşturulan ritüellerin frontend'de görünmesi

### P1 - Orta Öncelik
- [ ] Premium üyelik sistemi (ödeme entegrasyonu)
- [ ] Frekans Kartları editörü
- [ ] TTS Ayarları sayfası
- [ ] Kullanıcı yönetimi

### P2 - Düşük Öncelik
- [ ] Görsel yükleme ve sembolik yorum
- [ ] Kullanıcı deneyim kaydı
- [ ] Ses/müzik katmanları (ambient sound)
- [ ] Mobil optimizasyon
- [ ] Çoklu dil desteği (İngilizce)
