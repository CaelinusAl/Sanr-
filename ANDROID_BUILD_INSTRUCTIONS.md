# CAELINUS AI - Android Internal Test Build Instructions

## 📱 Overview
Bu döküman, CAELINUS AI uygulamasını Android APK olarak nasıl derleyeceğinizi açıklar.

---

## 🔧 Gereksinimler

### Bilgisayarınızda kurulu olmalı:
1. **Android Studio** (Arctic Fox veya üzeri)
   - https://developer.android.com/studio
2. **Node.js** (v18+)
3. **Yarn** (v1.22+)

### Android Studio'da kurulu olmalı (SDK Manager):
- Android SDK Platform 33 veya 34
- Android Build Tools
- Android Emulator (opsiyonel)

---

## 📥 Adım 1: Projeyi İndirin

```bash
# GitHub'dan clone (veya Emergent'ten export)
git clone [repo-url] caelinus-ai
cd caelinus-ai/frontend
```

---

## 📦 Adım 2: Dependencies Yükleyin

```bash
# Frontend dependencies
yarn install

# Capacitor sync
npx cap sync android
```

---

## 🔨 Adım 3: Android Studio'da Açın

1. Android Studio'yu açın
2. **Open an existing project** seçin
3. `frontend/android` klasörünü seçin
4. Gradle sync tamamlanmasını bekleyin

---

## 🔑 Adım 4: Build Configuration

### Debug Build (Internal Testing):
1. Android Studio'da **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçin
2. APK şurada oluşur: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (Production):
1. Keystore oluşturun veya mevcut olanı kullanın:
```bash
keytool -genkey -v -keystore release.keystore -alias caelinus -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/app/build.gradle` dosyasında signing config ekleyin
3. **Build > Generate Signed Bundle / APK** seçin

---

## 📲 Adım 5: APK'yı Test Edin

### Emulator'da:
1. Android Studio'da emulator başlatın
2. APK'yı sürükle-bırak yapın

### Fiziksel Cihazda:
1. USB Debugging aktif edin (Developer Options)
2. Cihazı bağlayın
3. `adb install app-debug.apk`

---

## 🚀 Adım 6: Google Play Internal Testing

### Internal Testing Track'e Yükleme:

1. **Google Play Console**'a gidin
2. Yeni uygulama oluşturun veya mevcut olanı seçin
3. **Release > Testing > Internal testing** seçin
4. **Create new release** tıklayın
5. AAB dosyasını yükleyin (APK yerine AAB tercih edilir)
6. Testers ekleyin (email listesi)
7. **Save** ve **Review release** tıklayın

### AAB Oluşturma:
```bash
# Android Studio'da:
Build > Build Bundle(s) / APK(s) > Build Bundle(s)
```

AAB dosyası: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ⚙️ Capacitor Configuration

`capacitor.config.ts` dosyası önemli ayarları içerir:

```typescript
const config: CapacitorConfig = {
  appId: 'com.caelinus.ai',
  appName: 'CAELINUS AI',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true // Test için
  },
  android: {
    backgroundColor: '#0a0a0f',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0f',
      splashFullScreen: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f'
    }
  }
};
```

---

## 🎨 App Assets

### App Icon:
- Dosya: `/store_assets/` klasöründeki icon
- Android Studio'da: `android/app/src/main/res/mipmap-*`
- **Image Asset Studio** ile oluşturun

### Splash Screen:
- Dosya: `/store_assets/` klasöründeki splash
- `android/app/src/main/res/drawable/splash.png`

---

## 🔍 Test Edilecek Özellikler

Internal test'te şunları doğrulayın:

### ✅ Feature Gates
- [ ] Cities: 20/81 şehir limiti görünüyor
- [ ] Ritüeller: Book 112 kilitli
- [ ] SANRI: 3/3 günlük limit

### ✅ Upgrade Flow
- [ ] Day 3 soft prompt çalışıyor
- [ ] Day 7 main modal çalışıyor
- [ ] Premium sayfasına yönlendirme

### ✅ Bilingual
- [ ] TR/EN geçişi çalışıyor
- [ ] Tüm metinler doğru dilde

### ✅ Core Features
- [ ] SANRI sohbet çalışıyor
- [ ] Ritüeller başlatılabiliyor
- [ ] Şehir detayları açılıyor
- [ ] Profil sayfası yükleniyor

---

## 🐛 Troubleshooting

### "SDK location not found" hatası:
`android/local.properties` dosyası oluşturun:
```
sdk.dir=/Users/USERNAME/Library/Android/sdk
```
(Windows için: `sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk`)

### "Failed to find Build Tools" hatası:
Android Studio SDK Manager'dan Build Tools indirin.

### "Gradle sync failed" hatası:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

---

## 📝 Version Info

- **App Version**: 1.0.0
- **Version Code**: 1
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: 34 (Android 14)
- **Capacitor Version**: 6.x

---

## 📞 Support

Sorularınız için: [Emergent Platform]

---

**Internal Test Build - Not for Production**
