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
| SANRI'ya Sor | `/sanriya-sor` | ✅ Tamamlandı (MOCK) |
| Hakkında | `/hakkinda` | ✅ Tamamlandı |

### Ritüel Alanı - Derinleştirilmiş Akış
1. **Giriş Eşiği** - 3 nefes sonrası niyet kapısı açılır
2. **7 Kutsal Kapı Seçimi** - Her kapı farklı bilinç katmanına götürür
3. **Kapı Girişi** - Frekans cümlesi, davet ve sembolik soru
4. **Bilinç Katmanı** (YENİ) - Giriş, derinlik, frekans metinleri
5. **DUR** - Dinamik frekans titreşim metinleri
6. **HİSSET** - Nefes animasyonu ile beden farkındalığı
7. **BIRAK** (YENİ) - Sonsuzluk sembolü ile bırakma alanı
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
- 6 katmanlı yansıma sistemi (MOCK)
- Sembol, sayı, hece okuma
- Hikaye tohumu ve idrak sorusu
- Selin Irmak tonu: sıcak, şiirsel, insan dili

## Teknik Yapı
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (minimal)
- **Veritabanı**: MongoDB
- **UI**: Shadcn/UI components

## Data Dosyaları
- `/data/cities.js` - 81 şehir bilinci
- `/data/rituel-data.js` - Kapılar, ritüeller, bilinç katmanları
- `/data/sanri-dictionary.js` - Sembol ve sayı sözlüğü
- `/data/bilinc-frekans.js` - Mikro-metinler
- `/data/layer-responses.js` - Okuma katmanları

## Son Güncelleme: 18 Ocak 2026
- Ritüel Alanı bilinç ve frekans katmanlarıyla derinleştirildi
- Yeni bilinç katmanı aşaması eklendi
- BIRAK aşaması eklendi
- Her kapı için özel bilinç metinleri tanımlandı
- Mühür yansımaları ve ritüel sonu soruları eklendi
- SANRI bağlantısı ritüel sonuna entegre edildi

### Erişilebilirlik İyileştirmeleri (18 Ocak 2026)
- Light mode renk kontrastı artırıldı (WCAG uyumlu)
- Ana sayfa font boyutları büyütüldü (başlık, alt başlık, açıklama)
- Satır aralıkları ve harf aralıkları iyileştirildi
- "Haritayı Keşfet" butonu metin ile örtüşmeyecek şekilde ayrıldı
- Hero bölümü arka plan overlay güçlendirildi
- Text shadow eklendi (arka plan üzerinde okunabilirlik)
- Butonlara backdrop blur ve shadow eklendi

## Gelecek Görevler (Backlog)
- [ ] SANRI'ya Sor için LLM entegrasyonu (opsiyonel)
- [ ] Görsel/fotoğraf analizi özelliği
- [ ] Kullanıcı deneyim kaydı (localStorage)
- [ ] Ses/müzik katmanları
- [ ] Mobil optimizasyon iyileştirmeleri
