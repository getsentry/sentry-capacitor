import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import * as Sentry from '@sentry/capacitor';
import { Integrations } from '@sentry/tracing';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ATTENTION: Change the DSN below with your own to see the events in Sentry. Get one at sentry.io
Sentry.init({
  dsn:
    'https://4079af8b316240ea9453eb0a23b715cc@o447951.ingest.sentry.io/5522756',
  // An array of strings or regexps that'll be used to ignore specific errors based on their type/message
  ignoreErrors: [/MiddleEarth_\d\d/, 'RangeError'],
  // Debug mode with valuable initialization/lifecycle information
  debug: true,
  // Whether SDK should be enabled or not
  enabled: true,
  integrations: [new Integrations.BrowserTracing()],
  // A release identifier
  release: '1537345109360',
  // An environment identifier
  environment: 'staging',
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
