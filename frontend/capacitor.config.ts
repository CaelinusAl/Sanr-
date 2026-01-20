import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caelinus.ai',
  appName: 'CAELINUS AI',
  webDir: 'build',
  // Internal Test: Local build kullan, production URL'ye yönlendirme
  server: {
    // Internal Test için: bundle edilmiş web assets kullan
    // Production'da: 'https://www.caelinus.com' olarak değiştirilecek
    androidScheme: 'https',
    cleartext: true // Test için
  },
  android: {
    buildOptions: {
      keystorePath: undefined, // Debug build için keystore gerekmez
      keystoreAlias: undefined,
    },
    // Status bar ve navigation bar renkleri
    backgroundColor: '#0a0a0f',
    allowMixedContent: true // Test için API calls
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f'
    },
    App: {
      // Deep link scheme
      appUrlOpen: true
    }
  }
};

export default config;
