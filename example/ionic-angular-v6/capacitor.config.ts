import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-angular',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  webDir: 'www',
};

export default config;
