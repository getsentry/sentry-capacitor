import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { createErrorHandler, init as sentryAngularInit } from '@sentry/angular';
import * as Sentry from '@sentry/capacitor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// ATTENTION: Change the DSN below with your own to see the events in Sentry. Get one at sentry.io
Sentry.init(
  {
    dsn:
      'https://4079af8b316240ea9453eb0a23b715cc@o447951.ingest.sentry.io/5522756',
    // An array of strings or regexps that'll be used to ignore specific errors based on their type/message
    ignoreErrors: [/MiddleEarth_\d\d/, 'RangeError'],
    // To see what the Sentry SDK is doing; Helps when setting things up
    debug: true,
    // Whether SDK should be enabled or not
    enabled: true,
    // Use the tracing integration to see traces and add performance monitoring
    _experiments: {
      enableMetrics: true,
      beforeSendMetric: (metric) => {
        return metric;
      },
    },
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
      Sentry.spotlightIntegration({
        sidecarUrl: environment.spotlightSidecarUrl,
      }),
    ],
    enableLogs: true,
    beforeSendLog: (log) => {
      return log;
    },
    // A release identifier
    release: '1.0.0',
    // A dist identifier
    dist: '1.0.0.1',
    // An environment identifier
    environment: 'staging',
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 1.0,    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
  },
  sentryAngularInit,
);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    /* Provide the @sentry/angular error handler */
    {
      provide: ErrorHandler,
      useValue: createErrorHandler(),
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
