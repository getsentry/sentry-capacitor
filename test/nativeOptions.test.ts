import type { StackParser } from '@sentry/core';
import type { CapacitorOptions } from 'src';
// Use shared mock to avoid conflicts
import { setupCapacitorMock } from './mocks/capacitor';

setupCapacitorMock();

import { Capacitor } from '@capacitor/core';
import { FilterNativeOptions } from '../src/nativeOptions';
import { CAP_GLOBAL_OBJ } from '../src/utils/webViewUrl';
import { expectPlatformWithReturn } from './extensions/sentryCapacitorJest';


describe('nativeOptions', () => {
  const mockGetPlatform = Capacitor.getPlatform as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlatform.mockReturnValue('web2');
    // Clean up spotlight URL before each test
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up spotlight URL after each test
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
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
    const filteredOptions: CapacitorOptions & { enableLogs?: boolean } = {
      enableLogs: true
    };
    const expectedOptions = {
      enableLogs: true
    };

    const nativeOptions = FilterNativeOptions(filteredOptions);

    expectPlatformWithReturn('android');
    expect(JSON.stringify(nativeOptions)).toEqual(JSON.stringify(expectedOptions));
  });

  test('Ignore logger on iOS', () => {
    mockGetPlatform.mockReturnValue('ios');
    const filteredOptions: CapacitorOptions & { enableLogs?: boolean } = {
      enableLogs: true
    };

    const nativeOptions = FilterNativeOptions(filteredOptions);

    expectPlatformWithReturn('ios');
    expect(nativeOptions).toEqual({});
  });

  test('Should include spotlight sidecarUrl when CAP_SPOTLIGHT_URL is set', () => {
    const spotlightUrl = 'http://192.168.8.150:8969/stream';
    CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL = spotlightUrl;

    const nativeOptions = FilterNativeOptions({
      environment: 'test',
    });

    expect(nativeOptions).toHaveProperty('sidecarUrl', spotlightUrl);
  });

  test('Should not include spotlight sidecarUrl when CAP_SPOTLIGHT_URL is not set', () => {
    // Ensure CAP_SPOTLIGHT_URL is not set
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;

    const nativeOptions = FilterNativeOptions({
      environment: 'test',
    });

    expect(nativeOptions).not.toHaveProperty('sidecarUrl');
  });

  test('Should not include spotlight sidecarUrl when CAP_SPOTLIGHT_URL is undefined', () => {
    CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL = undefined;

    const nativeOptions = FilterNativeOptions({
      environment: 'test',
    });

    expect(nativeOptions).not.toHaveProperty('sidecarUrl');
  });

  test('Should include spotlight sidecarUrl along with other options', () => {
    const spotlightUrl = 'http://192.168.8.150:8969/stream';
    CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL = spotlightUrl;

    const options: CapacitorOptions = {
      environment: 'production',
      dsn: 'https://example@sentry.io/123',
      release: '1.0.0',
    };

    const nativeOptions = FilterNativeOptions(options);

    expect(nativeOptions).toHaveProperty('sidecarUrl', spotlightUrl);
    expect(nativeOptions.environment).toBe('production');
    expect(nativeOptions.dsn).toBe('https://example@sentry.io/123');
    expect(nativeOptions.release).toBe('1.0.0');
  });
});
