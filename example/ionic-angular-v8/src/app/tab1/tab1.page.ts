import { Component } from '@angular/core';

import * as Sentry from '@sentry/capacitor';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {
  constructor() { }

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

  public setScope(): void {
    const dateString = new Date().toString();

    Sentry.setUser({
      id: 'test-id-0',
      email: 'testing@testing.test',
      username: 'USER-TEST',
      specialField: 'special user field',
      specialFieldNumber: 418,
    });

    Sentry.setTag('SINGLE-TAG', dateString);
    // @ts-ignore
    Sentry.setTag('SINGLE-TAG-NUMBER', 100);
    Sentry.setTags({
      'MULTI-TAG-0': dateString,
      'MULTI-TAG-1': dateString,
      'MULTI-TAG-2': dateString,
    });

    Sentry.setExtra('SINGLE-EXTRA', dateString);
    Sentry.setExtra('SINGLE-EXTRA-NUMBER', 100);
    Sentry.setExtra('SINGLE-EXTRA-OBJECT', {
      message: 'I am a teapot',
      status: 418,
      array: ['boo', 100, 400, { objectInsideArray: 'foobar' }],
    });
    Sentry.setExtras({
      'MULTI-EXTRA-0': dateString,
      'MULTI-EXTRA-1': dateString,
      'MULTI-EXTRA-2': dateString,
    });

    Sentry.setContext('TEST-CONTEXT', {
      stringTest: 'Hello',
      numberTest: 404,
      objectTest: {
        foo: 'bar',
      },
      arrayTest: ['foo', 'bar', 400],
      nullTest: null,
      undefinedTest: undefined,
    });

    Sentry.addBreadcrumb({
      level: 'info' as Sentry.SeverityLevel,
      message: `TEST-BREADCRUMB-INFO: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'debug' as Sentry.SeverityLevel,
      message: `TEST-BREADCRUMB-DEBUG: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'error' as Sentry.SeverityLevel,
      message: `TEST-BREADCRUMB-ERROR: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'fatal' as Sentry.SeverityLevel,
      message: `TEST-BREADCRUMB-FATAL: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'info' as Sentry.SeverityLevel,
      message: `TEST-BREADCRUMB-DATA: ${dateString}`,
      data: {
        stringTest: 'Hello',
        numberTest: 404,
        objectTest: {
          foo: 'bar',
        },
        arrayTest: ['foo', 'bar', 400],
        nullTest: null,
        undefinedTest: undefined,
      },
      category: 'TEST-CATEGORY',
    });

    // eslint-disable-next-line no-console
    console.log('Test scope properties were set.');
  }

  public clearUser(): void {
    Sentry.setUser(null);
  }

  public clearBreadcrumbs(): void {
    Sentry.getGlobalScope().clearBreadcrumbs();
    Sentry.getIsolationScope().clearBreadcrumbs();
    Sentry.getCurrentScope().clearBreadcrumbs();
  }

  public clearTestContext(): void {
    Sentry.setContext('TEST-CONTEXT', null);
  }

  public createMetric(): void {
    // Create a metric using Sentry metrics API
    Sentry.metrics.count('test.metric.counter', 1,
      { attributes: { from_test_app: true } },
    );
  }
}
