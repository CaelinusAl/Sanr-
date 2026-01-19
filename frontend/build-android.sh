#!/bin/bash

# CAELINUS AI - Android Build Script
# Bu script Android Studio kurulu bir makinede çalıştırılmalıdır

set -e

echo "🔮 CAELINUS AI - Android Build Pipeline"
echo "========================================"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Proje dizini
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Android SDK kontrolü
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}❌ ANDROID_HOME environment variable bulunamadı${NC}"
    echo "Android Studio'yu kurun ve ANDROID_HOME'u ayarlayın"
    echo "  macOS: export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "  Linux: export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "  Windows: set ANDROID_HOME=C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk"
    exit 1
fi

echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"

# Java kontrolü
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java bulunamadı. JDK 17+ kurun.${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d '"' -f 2)
echo -e "${GREEN}✓ Java Version: $JAVA_VERSION${NC}"

# Yarn kontrolü
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Yarn bulunamadı. npm install -g yarn${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Yarn kurulu${NC}"

# Build tipi seçimi
BUILD_TYPE=${1:-"bundle"}

echo ""
echo -e "${BLUE}📦 Build Tipi: $BUILD_TYPE${NC}"
echo ""

# 1. Dependencies kurulumu
echo -e "${YELLOW}📥 Step 1/5: Dependencies kurulumu...${NC}"
cd "$PROJECT_DIR"
yarn install

# 2. Web build
echo -e "${YELLOW}🔧 Step 2/5: Web Build...${NC}"
yarn build
echo -e "${GREEN}✓ Web build tamamlandı${NC}"

# 3. Capacitor sync
echo -e "${YELLOW}🔄 Step 3/5: Capacitor Sync...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Capacitor sync tamamlandı${NC}"

# 4. Gradle build
echo -e "${YELLOW}🏗️  Step 4/5: Android Build...${NC}"
cd "$PROJECT_DIR/android"

if [ "$BUILD_TYPE" = "apk" ]; then
    echo "Building APK..."
    ./gradlew assembleRelease
    OUTPUT_PATH="app/build/outputs/apk/release/app-release.apk"
    OUTPUT_NAME="CAELINUS-AI-v1.0.0.apk"
else
    echo "Building AAB (Google Play)..."
    ./gradlew bundleRelease
    OUTPUT_PATH="app/build/outputs/bundle/release/app-release.aab"
    OUTPUT_NAME="CAELINUS-AI-v1.0.0.aab"
fi

# 5. Output
echo ""
echo -e "${YELLOW}📁 Step 5/5: Output...${NC}"

if [ -f "$OUTPUT_PATH" ]; then
    # Çıktıyı kopyala
    cp "$OUTPUT_PATH" "$PROJECT_DIR/$OUTPUT_NAME"
    
    FILE_SIZE=$(du -h "$PROJECT_DIR/$OUTPUT_NAME" | cut -f1)
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ BUILD BAŞARILI!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "📦 Dosya: ${BLUE}$PROJECT_DIR/$OUTPUT_NAME${NC}"
    echo -e "📊 Boyut: ${BLUE}$FILE_SIZE${NC}"
    echo ""
    
    if [ "$BUILD_TYPE" = "bundle" ]; then
        echo -e "${YELLOW}📤 Google Play Console'a yüklemek için:${NC}"
        echo "   1. https://play.google.com/console adresine gidin"
        echo "   2. CAELINUS AI uygulamasını seçin"
        echo "   3. Release > Production > Create new release"
        echo "   4. $OUTPUT_NAME dosyasını yükleyin"
    else
        echo -e "${YELLOW}📱 APK'yı test etmek için:${NC}"
        echo "   adb install $OUTPUT_NAME"
    fi
else
    echo -e "${RED}❌ Build başarısız! Output bulunamadı.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🔮 CAELINUS AI - Bilinç Yükseliyor 🔮${NC}"
