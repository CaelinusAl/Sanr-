# CAELINUS AI - Store Release Plan (ST_O_RE)
# Google Play Store + Apple App Store Release Checklist

## 🎯 MINIMUM STORE-READY CRITERIA

### P0 Features (Must Complete Before Store Submission)

| Feature | Status | Priority |
|---------|--------|----------|
| GÖRSELİN: Hologram Generate API Connection | ⏳ TODO | P0 |
| GÖRSELİN: Watermark Toggle (Premium Only) | ⏳ TODO | P0 |
| GÖRSELİN: Image Upload + Analysis API | ⏳ TODO | P0 |
| Sign in with Apple (iOS Requirement) | ⏳ TODO | P0 |
| Loading States (All API Calls) | ⏳ TODO | P0 |
| Error Handling (User-Friendly Messages) | ⏳ TODO | P0 |
| Privacy Policy Page | ⏳ TODO | P0 |
| Terms of Service Page | ⏳ TODO | P0 |
| Account Deletion (In-App) | ✅ DONE | P0 |
| Data Export (GDPR) | ✅ DONE | P0 |

### Completed Features
- ✅ User Authentication (Google OAuth + Email/Password)
- ✅ Bilinç Profili (4-Question Onboarding)
- ✅ SANRI AI Chat
- ✅ Premium Rituals with SANRI VOICE
- ✅ Admin Panel (Users, Rituals, Visual Presets)
- ✅ Bilingual Support (TR/EN)

---

## 📱 ANDROID - GOOGLE PLAY STORE

### Play Console Listing Requirements

#### Basic Info
- **App Name**: CAELINUS AI
- **Package ID**: com.caelinus.ai
- **Category**: Health & Fitness > Meditation
- **Content Rating**: Everyone (no violence, no gambling)
- **Target Audience**: 18+ (consciousness/spiritual content)

#### Store Listing Text

**Short Description (80 chars max):**
```
TR: Bilinç alanına davet. Ritüeller, rüya yorumları ve frekans deneyimleri.
EN: Enter consciousness space. Rituals, dream interpretation, frequency work.
```

**Full Description (4000 chars max):**
```
TR:
CAELINUS AI - Bilinç Deneyimi Platformu

Bilgi değil, idrak üretir.
Sorular seni hatırlatmak için var.

CAELINUS, bir uygulama değil, bilinç alanıdır. 
Kendini hatırlamak isteyenler için tasarlandı.

🌙 SANRI'YA SOR
Kişisel bilinç rehberin SANRI ile konuş. Rüyalarını yorumlat, 
sembolik anlamları keşfet, doğum matriksini oku.

🕯️ RİTÜEL ALANI
Zihin sessizliği, bilinç açılımı ve yaratım ritüelleriyle 
içsel dönüşüm deneyimle. SANRI VOICE ile rehberlik al.

✨ GÖRSELİN
Sembolik hologramlar üret, görsellerini yorumlat.
AI destekli bilinç görselleştirmesi.

📿 BİLİNÇ ALANI
Bilinç metinleri, frekans kartları ve günlük içgörüler.

ÖZELLİKLER:
• Kişiselleştirilmiş SANRI deneyimi
• Premium ritüeller ve sesli rehberlik
• Türkçe ve İngilizce dil desteği
• Karanlık, huzurlu arayüz tasarımı
• Gizlilik odaklı - verilerini kontrol et

Premium özellikler admin tarafından aktifleştirilir.
Uygulama içi satın alma bulunmamaktadır.

---
EN:
CAELINUS AI - Consciousness Experience Platform

Not information, but perception.
Questions exist to remind you.

CAELINUS is not an app, it's a consciousness space.
Designed for those who want to remember themselves.

🌙 ASK SANRI
Talk to your personal consciousness guide SANRI. 
Interpret dreams, discover symbolic meanings, read birth matrix.

🕯️ RITUAL SPACE
Experience inner transformation with mind silence, 
consciousness expansion, and creation rituals.

✨ THE VISUAL
Generate symbolic holograms, interpret your images.
AI-powered consciousness visualization.

📿 CONSCIOUSNESS SPACE
Consciousness texts, frequency cards, and daily insights.

FEATURES:
• Personalized SANRI experience
• Premium rituals with voice guidance
• Turkish and English language support
• Dark, peaceful interface design
• Privacy-focused - control your data

Premium features are activated by admin.
No in-app purchases.
```

#### Screenshots Spec (Android)
| Type | Size | Count |
|------|------|-------|
| Phone | 1080x1920 or 1080x2340 | 4-8 |
| 7" Tablet | 1200x1920 | 1-4 (optional) |
| 10" Tablet | 1800x2560 | 1-4 (optional) |

**Required Screenshots:**
1. Welcome/Splash screen
2. Login page (Google + Apple + Email)
3. Onboarding - Bilinç Profili
4. Home page (5-card navigation)
5. SANRI'ya Sor (chat interface)
6. Ritüel Player (with audio controls)
7. GÖRSELİN (hologram generation)
8. Profile/Settings

#### Feature Graphic
- **Size**: 1024x500 px
- **Format**: PNG or JPEG
- **Content**: App logo, tagline "Bilgi değil, idrak üretir."

#### App Icon
- **Size**: 512x512 px
- **Format**: PNG (32-bit with alpha)
- **Style**: Infinity symbol (∞) with amber/gold gradient

### Privacy & Compliance

#### Data Safety Section
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account creation |
| Name | Yes | No | Personalization |
| User Content (onboarding answers) | Yes | No | SANRI personalization |
| Usage Data | Yes | No | Analytics |
| Uploaded Images | Yes (for analysis) | No | AI image interpretation |

#### Account Deletion
- ✅ Endpoint: `/api/user/delete`
- Must be accessible from Settings > Account > Delete Account
- Must complete within 3 days (Google requirement)

### Release Tracks
1. **Internal Testing** → 100 testers max, immediate
2. **Closed Testing** → Invite-only, 3+ testers required
3. **Open Testing** → Public beta, review required
4. **Production** → Full release, review required

### Android Build Checklist
- [ ] Update versionCode in build.gradle (current: 1)
- [ ] Update versionName in build.gradle (current: "1.0.0")
- [ ] Generate release keystore (already configured)
- [ ] Sign APK/AAB with release keystore
- [ ] Test release build on physical device
- [ ] Run `build-android.sh` script locally

---

## 🍎 iOS - APP STORE CONNECT

### App Store Listing Requirements

#### Basic Info
- **App Name**: CAELINUS AI
- **Bundle ID**: com.caelinus.ai
- **Category**: Health & Fitness > Meditation
- **Age Rating**: 17+ (Unrestricted Web Access - for AI features)
- **Availability**: Turkey, United States (expand later)

#### Store Listing Text
Same as Android (translated)

#### Screenshots Spec (iOS)
| Device | Size | Count |
|--------|------|-------|
| iPhone 6.7" (15 Pro Max) | 1290x2796 | 3-10 |
| iPhone 6.5" (11 Pro Max) | 1242x2688 | 3-10 |
| iPhone 5.5" (8 Plus) | 1242x2208 | 3-10 |
| iPad Pro 12.9" | 2048x2732 | 1-10 (optional) |

#### App Preview Video (Optional)
- **Duration**: 15-30 seconds
- **Size**: 1920x1080 or device-specific
- **Format**: H.264, AAC audio

### Sign in with Apple (REQUIRED)

**Apple Requirement**: If app offers Google/social login, Sign in with Apple MUST be provided as an option.

#### Implementation Plan
1. Enable Sign in with Apple capability in Xcode
2. Add Apple authentication backend endpoint
3. Add Apple login button to GirisPage.jsx
4. Process Apple ID token and create user account

### iOS Build Checklist
- [ ] Create Apple Developer Account ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Enable Sign in with Apple capability
- [ ] Create provisioning profiles (Development + Distribution)
- [ ] Add iOS platform to Capacitor (`npx cap add ios`)
- [ ] Configure Info.plist with required permissions
- [ ] Build and test in Xcode Simulator
- [ ] Test on physical iOS device
- [ ] Archive and upload to App Store Connect
- [ ] Submit for TestFlight review
- [ ] Submit for App Store review

### TestFlight Plan
1. **Internal Testing** → Team members only, no review
2. **External Testing** → Up to 10,000 testers, review required
3. **Public Link** → Share via URL

---

## 📋 COMPLIANCE CHECKLIST

### Privacy Policy Requirements

#### Must Include:
- [ ] What data is collected (email, name, onboarding answers, usage, images)
- [ ] How data is used (personalization, AI features)
- [ ] How data is stored (encrypted, secure servers)
- [ ] Data retention period
- [ ] Third-party services (OpenAI API for AI features)
- [ ] User rights (access, delete, export)
- [ ] Contact information
- [ ] KVKK compliance (Turkey)
- [ ] GDPR compliance (EU)

#### Privacy Policy URL Placeholder
```
https://www.caelinus.com/privacy-policy
https://www.caelinus.com/gizlilik-politikasi
```

### Terms of Service Requirements

#### Must Include:
- [ ] Service description
- [ ] User responsibilities
- [ ] Prohibited content/behavior
- [ ] Intellectual property rights
- [ ] Disclaimer (AI-generated content)
- [ ] Limitation of liability
- [ ] Termination conditions
- [ ] Governing law (Turkey)

#### Terms of Service URL Placeholder
```
https://www.caelinus.com/terms-of-service
https://www.caelinus.com/kullanim-kosullari
```

### Premium Content Wording

**⚠️ IMPORTANT**: Since no in-app purchase exists:
- ❌ Do NOT use: "Buy Premium", "Subscribe", "Purchase"
- ✅ Use: "Premium Özellikler", "Premium Features"
- ✅ Explain: "Premium özellikler admin tarafından aktifleştirilir"

---

## 📊 DATA INVENTORY

### Data Collected

| Data Type | Collection Point | Storage | Purpose | Sensitivity |
|-----------|-----------------|---------|---------|-------------|
| Email | Registration | MongoDB | Account | Low |
| Name | Registration | MongoDB | Display | Low |
| Profile Picture | Google OAuth | URL only | Display | Low |
| Onboarding Answers | Onboarding | MongoDB | SANRI Personalization | Medium |
| SANRI Conversations | Chat | MongoDB | Context | High |
| Ritual Plays | Usage | MongoDB | Analytics | Low |
| Uploaded Images | GÖRSELİN | Temp/Processed | AI Analysis | High |
| Usage Events | Throughout app | MongoDB | Analytics | Low |

### App Privacy Labels

#### iOS App Privacy
| Category | Data Types |
|----------|------------|
| Data Used to Track You | None |
| Data Linked to You | Email, Name, User Content |
| Data Not Linked to You | Usage Data, Diagnostics |

#### Google Play Data Safety
| Category | Data Types |
|----------|------------|
| Data collected | Email, Name, User content, App activity |
| Data shared | None |
| Security practices | Data encrypted in transit |

---

## ⏱️ TIMELINE

### Week 1: P0 Completion
- [ ] GÖRSELİN frontend-backend integration
- [ ] Sign in with Apple implementation
- [ ] Loading states and error handling polish
- [ ] Privacy Policy & Terms pages

### Week 2: Store Preparation
- [ ] Create/capture screenshots (8 screens, 2 languages)
- [ ] Design feature graphic
- [ ] Finalize app icon
- [ ] Write store descriptions
- [ ] Set up Play Console listing
- [ ] Set up App Store Connect listing

### Week 3: Testing
- [ ] Android internal testing track
- [ ] iOS TestFlight internal testing
- [ ] Bug fixes from testing
- [ ] Performance optimization

### Week 4: Submission
- [ ] Android production build
- [ ] iOS production build
- [ ] Submit to Google Play
- [ ] Submit to App Store
- [ ] Monitor review status

---

## ⚠️ RISKS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Apple Sign in with Apple rejection | HIGH | Must implement before iOS submission |
| AI content moderation | MEDIUM | Add content warnings, age gate |
| Privacy policy review | MEDIUM | Use lawyer-reviewed template |
| App review delays | MEDIUM | Submit early, respond quickly |
| Performance issues on older devices | LOW | Test on older Android 8+ devices |
| Localization issues | LOW | Native speaker review |

---

## 📁 STORE ASSETS LIST

### Android (Required)
- [ ] App Icon (512x512 PNG)
- [ ] Feature Graphic (1024x500 PNG/JPEG)
- [ ] Screenshots Phone (1080x1920, min 4)
- [ ] Short Description TR (80 chars)
- [ ] Short Description EN (80 chars)
- [ ] Full Description TR (4000 chars)
- [ ] Full Description EN (4000 chars)
- [ ] Privacy Policy URL
- [ ] Release APK/AAB

### iOS (Required)
- [ ] App Icon (1024x1024 PNG, no alpha)
- [ ] Screenshots iPhone 6.7" (min 3)
- [ ] Screenshots iPhone 6.5" (min 3)
- [ ] Screenshots iPhone 5.5" (min 3)
- [ ] App Preview Video (optional)
- [ ] Description TR
- [ ] Description EN
- [ ] Keywords (100 chars)
- [ ] Support URL
- [ ] Privacy Policy URL

---

## 🔧 IMMEDIATE ACTIONS

1. **Add Sign in with Apple** to login page (iOS requirement)
2. **Complete GÖRSELİN integration** (P0)
3. **Create Privacy Policy page** in app
4. **Update Premium UI wording** (no "buy" buttons)
5. **Add iOS platform** to Capacitor project
6. **Generate store assets** (screenshots, icons)
