<!-- SentryCapacitorVue.vue -->
<script lang="ts">
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonPage,
} from '@ionic/vue';

import * as Sentry from '@sentry/capacitor';

export default {
  name: 'HomePageView',
  components: {
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonPage,
  },
  methods: {
    createMessage() {
      Sentry.captureMessage('Hello VUE');
    },
    handledError() {
      try {
        throw Error('A handled error');
      } catch (ex) {
        Sentry.captureException(ex);
      }
    },
    crash() {
      Sentry.nativeCrash();
    },
    createMetric() {
      // Create a metric using Sentry metrics API
      // @ts-ignore - metrics API may not be fully typed
      if (Sentry.metrics && typeof Sentry.metrics.increment === 'function') {
        Sentry.metrics.increment('test.metric.counter', 1, {
          tags: { source: 'capacitor-sample-app' },
        });
      } else {
        // Fallback: create a custom metric using captureMessage with metric context
        Sentry.captureMessage('Metric created', {
          level: 'info',
          tags: {
            metric_type: 'counter',
            metric_name: 'test.metric.counter',
          },
          extra: {
            value: 1,
            timestamp: Date.now(),
          },
        });
      }
    },
  },
};
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Sentry Capacitor Vue</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-button @click="createMessage">Create Message</ion-button>
      <ion-button @click="handledError">Handled Error</ion-button>
      <ion-button @click="crash">Crash</ion-button>
      <ion-button @click="createMetric">Create Metric</ion-button>
    </ion-content>
  </ion-page>
</template>
