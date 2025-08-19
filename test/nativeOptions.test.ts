import type { StackParser } from '@sentry/core';
import type { CapacitorOptions } from 'src';
// Use shared mock to avoid conflicts
import { setupCapacitorMock } from './mocks/capacitor';

setupCapacitorMock();

// Now import after the mock is set up
import { Capacitor } from '@capacitor/core';
import { FilterNativeOptions } from '../src/nativeOptions';
import { expectPlatformWithReturn } from './extensions/sentryCapacitorJest';


describe('nativeOptions', () => {
  const mockGetPlatform = Capacitor.getPlatform as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlatform.mockReturnValue('web2');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('enableWatchdogTerminationTracking is set when defined', () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableWatchdogTerminationTracking: true
      });
    expect(nativeOptions.enableWatchdogTerminationTracking).toBeTruthy();
  });

  test('enableCaptureFailedRequests is set when defined', () => {
    const nativeOptions = FilterNativeOptions(
      {
        enableCaptureFailedRequests: true
      });
    expect(nativeOptions.enableCaptureFailedRequests).toBeTruthy();
  });

  test('invalid types not included', () => {
    const nativeOptions = FilterNativeOptions(
      {
        _experiments: { key: true },
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
        enableWatchdogTerminationTracking: true,
        enableCaptureFailedRequests: true,
        environment: 'Prod',
        ignoreErrors: ['test'],
        ignoreTransactions: ['test'],
        initialScope: {},
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

    // Since all parameters were invalid we can expect for an empty object.
    expect(keysFilter.toString()).toBe('');
  });

  test('Should include iOS parameters when running on iOS', () => {
    mockGetPlatform.mockReturnValue('ios');
    const expectedOptions: CapacitorOptions = {
      environment: 'abc',
      // iOS parameters
      enableAppHangTracking: true,
      appHangTimeoutInterval: 123
    };
    const nativeOptions = FilterNativeOptions(expectedOptions);

    expectPlatformWithReturn('ios');
    expect(JSON.stringify(nativeOptions)).toEqual(JSON.stringify(expectedOptions));
  });

  test('Should not include iOS parameters when running on android', () => {
    mockGetPlatform.mockReturnValue('android');
    const expectedOptions = {
      environment: 'abc',
    };
    const nativeOptions = FilterNativeOptions({
      ...expectedOptions, ...{
        appHangTimeoutInterval: 123,
        enableAppHangTracking: true
      }
    });

    expectPlatformWithReturn('android');
    expect(nativeOptions).toEqual(expectedOptions);
  });

  test('Set logger on Android', () => {
    mockGetPlatform.mockReturnValue('android');
    const filteredOptions: CapacitorOptions = {
      _experiments: { enableLogs : true}
    };
    const expectedOptions = {
      // @ts-ignore
      enableLogs : true
    };

    const nativeOptions = FilterNativeOptions(filteredOptions);

    expectPlatformWithReturn('android');
    expect(JSON.stringify(nativeOptions)).toEqual(JSON.stringify(expectedOptions));
  });

  test('Ignore logger on iOS', () => {
    mockGetPlatform.mockReturnValue('ios');
    const filteredOptions: CapacitorOptions = {
      _experiments: { enableLogs : true}
    };

    const nativeOptions = FilterNativeOptions(filteredOptions);

    expectPlatformWithReturn('ios');
    expect(nativeOptions).toEqual({});
  });
});
