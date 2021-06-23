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

  public regularException(): void {
    throw new Error(`${Date.now()}: regular exception`);
  }

  public sentryCapturedException(): void {
    Sentry.captureException(new Error(`${Date.now()}: a test error occurred`));
  }

  public errorWithUserData(): void {
    Sentry.setUser({
      id: '42',
      email: 'allknowingcomputer@email.com',
    });
    Sentry.captureException(new Error(`${Date.now()}: a test error occurred`));
  }

  public ignoredKeywordError(): void {
    Sentry.captureException(
      new Error(
        'Exception that will be ignored because of this keyword => MiddleEarth_42 <=',
      ),
    );
  }

  public ignoredTypeError(): void {
    Sentry.captureException(
      new RangeError('Exception that will be ignored because of its type'),
    );
  }
}
