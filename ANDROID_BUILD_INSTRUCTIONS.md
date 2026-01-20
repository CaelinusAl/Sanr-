# CAELINUS AI - Android Build Instructions (v2)

## 📱 Internal Test APK Build Guide

### Prerequisites
- Android Studio Arctic Fox or later
- JDK 17 or higher
- Android SDK (API 34)

---

## 🚀 Quick Build Steps

### Step 1: Get the Android Project
The Android project is already generated at: `/app/frontend/android/`

### Step 2: Open in Android Studio
1. Download/clone the project to your local machine
2. Open Android Studio
3. File → Open → Select the `android` folder
4. Wait for Gradle sync to complete (5-10 min first time)

### Step 3: Build Debug APK
1. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Alternative: Command Line Build
```bash
cd /app/frontend/android
./gradlew assembleDebug
```

---

## 📋 App Configuration

| Property | Value |
|----------|-------|
| Package | `com.caelinus.ai` |
| App Name | CAELINUS AI |
| Version | 1.0.0 |
| Min SDK | 22 (Android 5.1+) |
| Target SDK | 34 (Android 14) |

---

## 🧪 Google Play Internal Testing

### Setup Steps:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → "CAELINUS AI"
3. Go to Testing → Internal testing
4. Create release → Upload APK
5. Add tester emails (5-10 people)
6. Publish internal release
7. Send opt-in link to testers

### Tester Requirements:
- Google account
- Accept email invite
- Opt-in via provided link

---

## 🔄 Update Process

After web changes:
```bash
cd /app/frontend
yarn build
npx cap sync android
# Then rebuild APK
```

---

## ✅ Test Checklist

### Free User Flow
- [ ] Cities: 20/81 limit visible
- [ ] Rituals: Book 112 locked
- [ ] SANRI: 3 daily messages
- [ ] Upgrade modal works

### Features
- [ ] Language toggle (TR/EN)
- [ ] All pages load
- [ ] SANRI conversation works
- [ ] Profile page displays

---

## 🆘 Common Issues

**White screen:** Run `npx cap sync android`
**API errors:** Check network config allows API domain
**Crash on launch:** Check Logcat in Android Studio

---

**Backend API:** https://sanri-guide.preview.emergentagent.com/api
**DEMO_PREMIUM:** false (testing free experience)
