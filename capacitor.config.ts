import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sirkettebugun.app',
  appName: 'SirketteBugun',
  webDir: 'public',
  server: {
    url: 'http://192.168.1.35:3000',
    cleartext: true
  }
};

export default config;
