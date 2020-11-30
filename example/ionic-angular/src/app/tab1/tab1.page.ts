import { Component } from '@angular/core';

import * as Sentry from '@sentry/capacitor';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  constructor() {}

  public throwUnhandledException(): void {
    // @ts-ignore intentionally calling to demonstrate global error handling
    undefinedMethod();
  }

  public handledError(): void {
    try {
      // @ts-ignore intentionally calling to demonstrate catching exception in Sentry
      undefinedMethod();
    } catch (error) {
      Sentry.captureException(new Error(`${Date.now()}: ${error}`));
    }
  }

  public errorWithUserData(): void {
    Sentry.setUser({
      id: "42",
      email: "allknowingcomputer@email.com"
    })
    Sentry.captureException(new Error(`${Date.now()}: a test error occurred`));
  }
}
