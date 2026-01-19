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

## 🔧 Gereksinimler

- Node.js 18+
- Yarn
- Android Studio (Hedgehog+)
- JDK 17+

## 📁 Proje Yapısı

```
frontend/
├── capacitor.config.ts    # Capacitor yapılandırması
├── android/               # Android native projesi
│   ├── app/
│   │   ├── build.gradle   # App build config
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── res/       # İkonlar ve splash screen
│   │   │   └── java/      # Native kod
│   │   └── release.keystore (oluşturulacak)
│   └── build.gradle       # Root build config
└── build/                 # Web build çıktısı
```

## 🚀 Build Adımları

### 1. Web Build
```bash
cd frontend
yarn build
```

### 2. Capacitor Sync
```bash
npx cap sync android
```

### 3. Release Keystore Oluşturma (İLK DEFA)
```bash
cd android/app
keytool -genkey -v \
  -keystore release.keystore \
  -alias caelinus \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=CAELINUS AI, OU=Development, O=Caelinus, L=Istanbul, ST=Istanbul, C=TR"
```

⚠️ **ÖNEMLİ**: Keystore şifrelerini güvenli bir yerde saklayın! Kaybederseniz güncelleme yükleyemezsiniz.

### 4. gradle.properties Ayarları
`android/gradle.properties` dosyasına ekleyin:
```properties
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
RELEASE_KEY_ALIAS=caelinus
RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### 5. Release AAB Build
```bash
cd android
./gradlew bundleRelease
```

Çıktı: `android/app/build/outputs/bundle/release/app-release.aab`

### 6. APK Build (Test için)
```bash
./gradlew assembleRelease
```

Çıktı: `android/app/build/outputs/apk/release/app-release.apk`

## 🔗 App Links Kurulumu

### 1. SHA-256 Fingerprint Alın
```bash
keytool -list -v -keystore android/app/release.keystore -alias caelinus
```

Certificate fingerprints bölümünden SHA256 değerini kopyalayın.

### 2. assetlinks.json Oluşturun
`https://www.caelinus.com/.well-known/assetlinks.json` adresine:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.caelinus.ai",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

### 3. Test Edin
```bash
adb shell am start -a android.intent.action.VIEW -d "https://www.caelinus.com/bilinc-alani" com.caelinus.ai
```

## 📦 Play Store Yükleme Checklist

### Store Listing
- [ ] App title: CAELINUS AI
- [ ] Short description (80 karakter max)
- [ ] Full description (4000 karakter max)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (min 2, max 8)
  - Phone: 16:9 veya 9:16
  - Tablet 7": 16:9 veya 9:16
  - Tablet 10": 16:9 veya 9:16

### Content Rating
- [ ] IARC rating questionnaire tamamla
- [ ] Kategori: Health & Fitness veya Lifestyle

### Privacy Policy
- [ ] Privacy policy URL (zorunlu)
- [ ] Data safety form doldur

### Data Safety
Uygulama aşağıdaki verileri TOPLAMIYOR:
- [ ] Location - Hayır
- [ ] Personal info - Hayır (sadece anonymous usage)
- [ ] Financial info - Hayır (premium için 3rd party)
- [ ] Health and fitness - Hayır
- [ ] Messages - Hayır
- [ ] Photos and videos - Hayır
- [ ] Audio files - Hayır
- [ ] Files and docs - Hayır
- [ ] Calendar - Hayır
- [ ] Contacts - Hayır
- [ ] App activity - Opsiyonel (analytics için)
- [ ] Web browsing - Hayır
- [ ] App info and performance - Opsiyonel (crash reports)
- [ ] Device or other IDs - Opsiyonel

### Release Track
- [ ] Internal testing (ilk test için önerilir)
- [ ] Closed testing (beta kullanıcılar)
- [ ] Open testing (public beta)
- [ ] Production (tam yayın)

## 🛡️ Güvenlik Notları

1. **Keystore'u GIT'e eklemeyin!** `.gitignore`'a ekleyin:
   ```
   android/app/release.keystore
   android/gradle.properties
   ```

2. **Google Play App Signing kullanın** - Keystore'unuz kaybolsa bile güncelleme yapabilirsiniz.

3. **ProGuard/R8** - Production için `minifyEnabled true` yapabilirsiniz ama test edin.

## 🔄 Güncelleme Süreci

1. `versionCode` ve `versionName`'i artırın (`android/app/build.gradle`)
2. Web build yapın: `yarn build`
3. Sync: `npx cap sync android`
4. AAB build: `./gradlew bundleRelease`
5. Play Console'a yükleyin

## 🐛 Sorun Giderme

### Build hataları
```bash
cd android
./gradlew clean
./gradlew bundleRelease --stacktrace
```

### Capacitor sync sorunları
```bash
npx cap doctor
npx cap sync android --inline
```

### App Links çalışmıyor
1. assetlinks.json'un erişilebilir olduğunu kontrol edin
2. SHA256 fingerprint'in doğru olduğunu kontrol edin
3. AndroidManifest'te `android:autoVerify="true"` olduğunu kontrol edin
