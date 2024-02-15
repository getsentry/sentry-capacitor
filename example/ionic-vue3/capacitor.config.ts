import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.sentry.vue3',
  appName: 'sentry-capacitor-vue3',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
