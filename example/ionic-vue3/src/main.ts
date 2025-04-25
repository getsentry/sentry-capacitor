import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import * as SentryVue from '@sentry/vue';
import * as Sentry from '@sentry/capacitor';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);


Sentry.init({
  app,
  dsn: 'https://7f35532db4f8aca7c7b6992d488b39c1@o447951.ingest.sentry.io/4505912397660160',
  integrations: [
    SentryVue.vueIntegration({
      tracingOptions: {
        timeout: 1000,
        trackComponents: true,
        hooks: ["mount", "update", "unmount"]
      }
    }),
    SentryVue.replayCanvasIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
},
  // Forward the init method from @sentry/vue
  SentryVue.init
);


router.isReady().then(() => {
  app.mount('#app');
  app.mount('Hello')
});
