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
      Sentry.metrics.count('test.metric.counter', 1, {
        attributes: { from_test_app: true },
      });
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
