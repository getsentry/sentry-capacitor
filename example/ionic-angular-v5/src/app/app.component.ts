import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Store } from '@ngrx/store';
import { AppState } from './app.reducer';
import * as AppActions from './app.actions';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private store: Store<AppState>
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  increment() {
    console.log('INCREMENT');
    this.store.dispatch(AppActions.increment());
  }

  decrement() {
    console.log('DECREMENT');
    this.store.dispatch(AppActions.decrement());
  }
  triggerEffect() {
    console.log('TRIGGER');
    this.store.dispatch({ type: '[Example] Load Data' }); // Dispatch the action
  }

}
