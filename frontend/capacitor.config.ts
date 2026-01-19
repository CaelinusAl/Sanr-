import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caelinus.ai',
  appName: 'CAELINUS AI',
  webDir: 'build',
  server: {
    // Production URL - web app'in hosted olduğu adres
    url: 'https://www.caelinus.com',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'caelinus',
    },
    // App Links için hostname
    hostname: 'www.caelinus.com',
    // Status bar ve navigation bar renkleri
    backgroundColor: '#0a0a0f',
    allowMixedContent: false
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
