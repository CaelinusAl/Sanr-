# CAELINUS AI - Android Build & Release Guide

## 📱 Proje Bilgileri

| Özellik | Değer |
|---------|-------|
| App Name | CAELINUS AI |
| Package Name | com.caelinus.ai |
| Version | 1.0.0 (versionCode: 1) |
| Min SDK | 22 (Android 5.1) |
| Target SDK | 34 (Android 14) |
| Domain | www.caelinus.com |
| Deep Link | caelinus:// |

## 🔑 Keystore Bilgileri

⚠️ **ÖNEMLİ: Bu bilgileri güvenli bir yerde saklayın!**

| Parametre | Değer |
|-----------|-------|
| Keystore File | `android/app/release.keystore` |
| Keystore Alias | `caelinus` |
| Keystore Password | `Caelinus2026Secure!` |
| Key Password | `Caelinus2026Secure!` |
| SHA256 Fingerprint | `F6:3F:43:26:66:23:A1:0E:D7:08:09:C7:06:10:40:A2:2E:D6:9C:32:C5:56:9C:61:52:EB:B8:4D:2E:E2:4F:35` |

## 🔧 Gereksinimler

- Node.js 18+
- Yarn
- Android Studio (Hedgehog+)
- JDK 17+
- Android SDK (API 34)

## 🚀 Hızlı Build

### Otomatik Build Script
```bash
cd frontend

# AAB Build (Google Play için)
./build-android.sh

# APK Build (Test için)
./build-android.sh apk
```

### Manuel Build Adımları

#### 1. Web Build
```bash
cd frontend
yarn build
```

#### 2. Capacitor Sync
```bash
npx cap sync android
```

#### 3. Android Build
```bash
cd android

# AAB (Google Play)
./gradlew bundleRelease

# APK (Test)
./gradlew assembleRelease
```

#### Çıktılar:
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 🔗 App Links Kurulumu

### assetlinks.json
Dosya: `https://www.caelinus.com/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.caelinus.ai",
    "sha256_cert_fingerprints": [
      "F6:3F:43:26:66:23:A1:0E:D7:08:09:C7:06:10:40:A2:2E:D6:9C:32:C5:56:9C:61:52:EB:B8:4D:2E:E2:4F:35"
    ]
  }
}]
```

### Test
```bash
# Link açma testi
adb shell am start -a android.intent.action.VIEW \
  -d "https://www.caelinus.com/bilinc-alani" com.caelinus.ai

# Deep link testi
adb shell am start -a android.intent.action.VIEW \
  -d "caelinus://open" com.caelinus.ai
```

## 📦 Google Play Store Checklist

### 1. Store Listing (Zorunlu)

#### Türkçe
- **Title**: CAELINUS AI - Bilinç & Frekans
- **Short Description** (80 karakter):
  > Anadolu'nun uyanan enerjileriyle bilinç yolculuğuna çık. SANRI ile içsel dönüşümünü keşfet.

- **Full Description** (4000 karakter max):
  > CAELINUS AI, Anadolu'nun kadim bilgeliğini modern teknolojiyle buluşturan bir bilinç dönüşüm platformudur.
  >
  > 🔮 BİLİNÇ ALANI
  > Günlük bilinç kartlarıyla içsel farkındalığınızı geliştirin. Her kart, Anadolu'nun uyanan tanrıçalarının bilgeliğini taşır.
  >
  > 🎵 FREKANS ALANI  
  > Özel olarak tasarlanmış frekans kartlarıyla enerji dengenizi optimize edin. Meditasyon, odaklanma ve rahatlama için.
  >
  > ✨ SANRI'YA SOR
  > AI destekli rüya ve sembol yorumlama motorumuz SANRI ile iç dünyanızı keşfedin. Rüyalarınızı, sembollerinizi ve deneyimlerinizi derinlemesine anlayın.
  >
  > 🌙 RİTÜEL ALANI
  > Profesyonel olarak tasarlanmış ritüellerle günlük pratiklerinizi zenginleştirin. Sesli rehberlik ve zamanlayıcı ile tam bir deneyim.
  >
  > 🗺️ ANADOLU ŞEHİRLERİ
  > 81 ilin enerji haritasını keşfedin. Her şehrin kendine özgü frekansını ve tarihsel bilgeliğini deneyimleyin.
  >
  > Özellikler:
  > • Günlük bilinç ve frekans kartları
  > • AI destekli rüya yorumlama (SANRI)
  > • Sesli ritüel rehberliği
  > • Karanlık mod ve premium tasarım
  > • Türkçe arayüz
  >
  > CAELINUS AI, bilgi vermez - farkındalık uyandırır.
  > Rehberlik sunmaz - yansıtır.
  > Robotik değil, sıcak ve insani.

### 2. Grafikler (Zorunlu)

| Grafik | Boyut | Format |
|--------|-------|--------|
| App Icon | 512x512 px | PNG (32-bit) |
| Feature Graphic | 1024x500 px | PNG/JPEG |
| Screenshots (Phone) | 16:9 veya 9:16 | PNG/JPEG |
| Screenshots (Tablet 7") | 16:9 veya 9:16 | PNG/JPEG |
| Screenshots (Tablet 10") | 16:9 veya 9:16 | PNG/JPEG |

**Screenshot Önerileri:**
1. Ana sayfa (karanlık tema)
2. Bilinç Alanı kartları
3. Frekans Alanı
4. SANRI'ya Sor ekranı
5. Ritüel akışı
6. Şehir haritası

### 3. Content Rating

- **Kategori**: Health & Fitness veya Lifestyle
- **Rating**: E (Everyone)
- **İçerik**: Meditasyon, wellness, spiritual wellness

### 4. Privacy Policy

URL: `https://www.caelinus.com/privacy-policy`

### 5. Data Safety Form

| Veri Türü | Toplama | Paylaşım |
|-----------|---------|----------|
| Personal info | Hayır | Hayır |
| Financial info | Hayır | Hayır |
| Health and fitness | Hayır | Hayır |
| Messages | Hayır | Hayır |
| Photos and videos | Hayır | Hayır |
| Audio files | Hayır | Hayır |
| Location | Hayır | Hayır |
| Contacts | Hayır | Hayır |
| App activity | Opsiyonel (analytics) | Hayır |
| Web browsing | Hayır | Hayır |
| App info and performance | Opsiyonel (crash) | Hayır |
| Device identifiers | Opsiyonel | Hayır |

**Güvenlik Beyanı:**
- Veriler aktarım sırasında şifrelenir (HTTPS)
- Kullanıcı hesap silme talep edebilir (varsa)
- Veri toplama opsiyoneldir

### 6. Release Tracks

| Track | Kullanım |
|-------|----------|
| Internal Testing | Ekip içi test |
| Closed Testing | Beta kullanıcılar |
| Open Testing | Public beta |
| Production | Tam yayın |

**Önerilen Akış:**
1. Internal Testing → Ekip testi (1-2 gün)
2. Closed Testing → 20-50 beta kullanıcı (1 hafta)
3. Production → Tam yayın

## 🛡️ Güvenlik Notları

### .gitignore Eklemeleri
```
# Android keystore ve credentials
android/app/release.keystore
android/gradle.properties

# Google Play credentials
google-play-key.json
```

### Google Play App Signing
Google Play Console'da App Signing'i aktif edin:
1. Release > Setup > App signing
2. "Use Google Play App Signing" seçin
3. Upload key certificate'ı indirin

Bu sayede keystore kaybedilse bile güncelleme yapabilirsiniz.

## 🔄 Güncelleme Süreci

1. `android/app/build.gradle`'da version güncelle:
   ```gradle
   versionCode 2  // Her sürümde artır
   versionName "1.1.0"  // Semantic versioning
   ```

2. Build ve upload:
   ```bash
   ./build-android.sh
   # Play Console'a yükle
   ```

## 🐛 Sorun Giderme

### Build Hataları
```bash
cd android
./gradlew clean
./gradlew bundleRelease --stacktrace
```

### Capacitor Sorunları
```bash
npx cap doctor
npx cap sync android --inline
```

### App Links Çalışmıyor
1. assetlinks.json erişilebilirliği: `curl https://www.caelinus.com/.well-known/assetlinks.json`
2. SHA256 doğrulaması
3. AndroidManifest'te `android:autoVerify="true"`

---

**Son Güncelleme:** 19 Ocak 2026
**Hazırlayan:** CAELINUS AI Development Team
