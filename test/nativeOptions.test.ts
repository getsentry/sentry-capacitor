import { Capacitor } from '@capacitor/core';
import type { Instrumenter, StackParser } from '@sentry/types';
import type { CapacitorOptions } from 'src';

import { FilterNativeOptions } from '../src/nativeOptions';

// Mock the Capacitor module
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: jest.fn()
  }
}));


describe('nativeOptions', () => {

  test('Use value of enableOutOfMemoryTracking on enableWatchdogTerminationTracking when set true', async () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableOutOfMemoryTracking: true
      });
    expect(nativeOptions.enableWatchdogTerminationTracking).toBeTruthy();
  });

  test('Use value of enableOutOfMemoryTracking on enableWatchdogTerminationTracking when set false', async () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableOutOfMemoryTracking: false
      });
    expect(nativeOptions.enableWatchdogTerminationTracking).toBeFalsy();
  });

  test('enableWatchdogTerminationTracking is set when defined', async () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableWatchdogTerminationTracking: true
      });
    expect(nativeOptions.enableWatchdogTerminationTracking).toBeTruthy();
  });

  test('enableCaptureFailedRequests is set when defined', async () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableCaptureFailedRequests: true
      });
    expect(nativeOptions.enableCaptureFailedRequests).toBeTruthy();
  });

  test('invalid types not included', async () => {
    const nativeOptions = FilterNativeOptions(
      {
        _experiments: [true],
        _metadata: {},
        allowUrls: ['test'],
        attachStacktrace: true,
        attachThreads: true,
        beforeBreadcrumb: ((bread) => bread),
        beforeSend: ((evt) => evt),
        beforeSendTransaction: ((transaction) => transaction),
        debug: true,
        defaultIntegrations: [],
        denyUrls: [],
        dist: '1',
        dsn: 'dns',
        enableAutoSessionTracking: true,
        enabled: true,
        enableNative: true,
        enableNativeCrashHandling: true,
        enableNativeNagger: true,
        enableNdkScopeSync: true,
        enableOutOfMemoryTracking: true,
        enableTracing: true,
        enableCaptureFailedRequests: true,
        environment: 'Prod',
        ignoreErrors: ['test'],
        ignoreTransactions: ['test'],
        initialScope: {},
        instrumenter: {} as Instrumenter,
        integrations: [],
        maxBreadcrumbs: 100,
        maxValueLength: 100,
        normalizeDepth: 100,
        normalizeMaxBreadth: 100,
        release: '1',
        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: 1,
        sampleRate: 1,
        sendClientReports: true,
        sendDefaultPii: true,
        sessionTrackingIntervalMillis: 10,
        shutdownTimeout: 10,
        stackParser: {} as StackParser,
        tracesSampler: ((_) => 1),
        tracesSampleRate: 1,
        transportOptions: {},
        tunnel: 'test',
      });

    const keys = Object.keys(nativeOptions);
    const keysFilter = keys.filter(key =>
      // @ts-ignore allowed for testing.
      (typeof nativeOptions[key]) !== 'string' &&
      // @ts-ignore allowed for testing.
      (typeof nativeOptions[key]) !== 'number' &&
      // @ts-ignore allowed for testing.
      (typeof nativeOptions[key]) !== 'boolean' &&
      // @ts-ignore allowed for testing.
      (typeof nativeOptions[key]) !== undefined)

    expect(keysFilter.toString()).toBe('');
  });

  test('Should include iOS parameters when running on iOS', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('ios');

    const expectedOptions: CapacitorOptions = {
      environment: 'abc',
      // iOS parameters
      enableAppHangTracking: true,
      appHangTimeoutInterval: 123
    };
    const nativeOptions = FilterNativeOptions(expectedOptions);
      expect(JSON.stringify(nativeOptions)).toEqual(JSON.stringify(expectedOptions));
  });

  test('Should not include iOS parameters when running on android', async () => {
    (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');

    const expectedOptions = {
      environment: 'abc',
    };
    const nativeOptions = FilterNativeOptions({
      ...expectedOptions, ...{
        appHangTimeoutInterval: 123,
        enableAppHangTracking: true
      }
    });
      expect(nativeOptions).toEqual(expectedOptions);
  });

});
