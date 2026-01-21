import { type EventHint, type Exception, type StackFrame } from '@sentry/browser';
import type { Client, Event, Integration } from '@sentry/core';
import { init } from '../src/sdk';
import { NATIVE } from '../src/wrapper';

jest.mock('../src/wrapper', () => {
  return {
    NATIVE: {
      platform: 'web',
      initNativeSdk: jest.fn(() => Promise.resolve()),
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SDK Init', () => {
  // [name, platform, options, autoSessionTracking, enableNative, enableAutoSessionTracking]
  const table = [
    {
      name: 'Uses default options on web',
      platform: 'web',
      options: { dsn: '' },
      autoSessionTracking: true,
      expected: {
        enableNative: false,
        enableAutoSessionTracking: false,
      },
    },
    {
      name: 'Uses default options on ios',
      platform: 'ios',
      options: { dsn: '' },
      autoSessionTracking: false,
      expected: {
        enableNative: true,
        enableAutoSessionTracking: true,
      },
    },
    {
      name: 'Uses default options on android',
      platform: 'android',
      options: { dsn: '' },
      autoSessionTracking: false,
      expected: {
        enableNative: true,
        enableAutoSessionTracking: true,
      },
    },
    {
      name: 'enableAutoSessionTracking sets autoSessionTracking on web',
      platform: 'web',
      options: { dsn: '', enableAutoSessionTracking: false },
      autoSessionTracking: false,
      expected: {
        enableNative: false,
        enableAutoSessionTracking: false,
      },
    },
    {
      name: 'enableAutoSessionTracking sets enableAutoSessionTracking on android',
      platform: 'android',
      options: { dsn: '', enableAutoSessionTracking: false },
      autoSessionTracking: false,
      expected: {
        enableNative: true,
        enableAutoSessionTracking: false,
      },
    },
    {
      name: 'enableAutoSessionTracking sets enableAutoSessionTracking on ios',
      platform: 'ios',
      options: { dsn: '', enableAutoSessionTracking: false },
      autoSessionTracking: false,
      expected: {
        enableNative: true,
        enableAutoSessionTracking: false,
      },
    },
  ];
  it.each(table)('%s', ({ platform, options, expected }) => {
    NATIVE.platform = platform;

    init(options);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NATIVE.initNativeSdk).toHaveBeenCalledWith(
      expect.objectContaining(expected),
    );
  });


  test('Does not Enable Native SDK if enabled is false', async () => {
    NATIVE.platform = 'ios';
    const mockOriginalInit = jest.fn();

    init({
      enabled: false
    }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(NATIVE.initNativeSdk).toHaveBeenCalled();
        const nativeOptions = (NATIVE.initNativeSdk as jest.Mock).mock.calls[0][0];
        expect(nativeOptions.enableNative).toBe(false);
        expect(nativeOptions.enableNativeNagger).toBe(false);
        resolve();
      }, 0);
    });
  });

  test('Keep enableNative if set on mobile', async () => {
    NATIVE.platform = 'ios';
    const mockOriginalInit = jest.fn();

    init({
      enabled: true,
      enableNative: false
    }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(NATIVE.initNativeSdk).toHaveBeenCalled();
        const nativeOptions = (NATIVE.initNativeSdk as jest.Mock).mock.calls[0][0];
        expect(nativeOptions.enableNative).toBe(false);
        expect(nativeOptions.enableNativeNagger).toBe(true);
        expect(nativeOptions.enabled).toBe(true);
        resolve();
      }, 0);
    });
  });

  test('Keep enableNativeNagger if set on mobile', async () => {
    NATIVE.platform = 'ios';
    const mockOriginalInit = jest.fn();

    init({
      enabled: true,
      enableNative: false,
      enableNativeNagger: false
    }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(NATIVE.initNativeSdk).toHaveBeenCalled();
        const nativeOptions = (NATIVE.initNativeSdk as jest.Mock).mock.calls[0][0];
        expect(nativeOptions.enableNative).toBe(false);
        expect(nativeOptions.enableNativeNagger).toBe(false);
        expect(nativeOptions.enabled).toBe(true);
        resolve();
      }, 0);
    });
  });

  test('WEB has enableNative false by default', async () => {
    NATIVE.platform = 'web';
    const mockOriginalInit = jest.fn();

    init({
      enabled: true,
    }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(NATIVE.initNativeSdk).toHaveBeenCalled();
        const nativeOptions = (NATIVE.initNativeSdk as jest.Mock).mock.calls[0][0];
        expect(nativeOptions.enableNative).toBe(false);
        expect(nativeOptions.enableNativeNagger).toBe(false);
        expect(nativeOptions.enabled).toBe(true);
        resolve();
      }, 0);
    });
  });

  test('passes metrics experiments to browser options', () => {
    NATIVE.platform = 'web';
    const mockOriginalInit = jest.fn();
    const beforeSendMetric = jest.fn(metric => metric);

    init({
      dsn: 'test-dsn',
      enabled: true,
      _experiments: {
        enableMetrics: true,
        beforeSendMetric,
      },
    }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(mockOriginalInit).toHaveBeenCalled();
        const browserOptions = mockOriginalInit.mock.calls[0][0];

        expect(browserOptions.enableMetrics).toBe(true);
        expect(browserOptions.beforeSendMetric).toBe(beforeSendMetric);

        resolve();
      }, 0);
    });
  });

  test('RewriteFrames to be added by default', async () => {
    NATIVE.platform = 'web';
    const mockOriginalInit = jest.fn();

    init({ enabled: true }, mockOriginalInit);

    // Wait for async operations
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        expect(mockOriginalInit).toHaveBeenCalled();
        const browserOptions = mockOriginalInit.mock.calls[0][0];

        const rewriteFramesIntegration =
          Array.isArray(browserOptions.defaultIntegrations) &&
          browserOptions.defaultIntegrations.find(
            (integration: Integration) => integration.name === 'RewriteFrames');

        // Capacitor specific frame.
        const error = { values: [{ stacktrace: { frames: [{ filename: 'capacitor://localhost:8080/file.js' }] } }] };
        const expectedError =
        {
          filename: 'app:///file.js',
          in_app: true
        }

        expect(rewriteFramesIntegration).toBeDefined();

        if (!rewriteFramesIntegration) {
          throw new Error('rewriteFrames should be defined, but it is false');
        }

        const event = await rewriteFramesIntegration.processEvent(({ exception: error }) as Event, {} as EventHint, {} as Client);

        const [firstException] = event?.exception?.values as Exception[];
        const [firstFrame] = firstException?.stacktrace?.frames as StackFrame[];

        expect(firstFrame).toStrictEqual(expectedError);
        resolve();
      }, 0);
    });
  });

  describe('siblingOptions', () => {
    test('vueOptions are merged into browserOptions', () => {
      NATIVE.platform = 'web';
      const mockApp = { config: {} } as any;
      const mockOriginalInit = jest.fn();

      init({
        dsn: 'test-dsn',
        enabled: true,
        siblingOptions: {
          vueOptions: {
            app: mockApp,
            attachProps: false,
            attachErrorHandler: true,
          },
        },
      }, mockOriginalInit);

      // Wait for async operations
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockOriginalInit).toHaveBeenCalled();
          const browserOptions = mockOriginalInit.mock.calls[0][0];

          // Verify vueOptions are merged into browserOptions
          expect(browserOptions.app).toBe(mockApp);
          expect(browserOptions.attachProps).toBe(false);
          expect(browserOptions.attachErrorHandler).toBe(true);

          // Verify siblingOptions are not in browserOptions
          expect(browserOptions.siblingOptions).toBeUndefined();

          resolve();
        }, 0);
      });
    });

    test('nuxtClientOptions are merged into browserOptions', () => {
      NATIVE.platform = 'web';
      const mockOriginalInit = jest.fn();

      init({
        dsn: 'test-dsn',
        enabled: true,
        siblingOptions: {
          nuxtClientOptions: {
            attachProps: false,
            attachErrorHandler: false,
          },
        },
      }, mockOriginalInit);

      // Wait for async operations
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockOriginalInit).toHaveBeenCalled();
          const browserOptions = mockOriginalInit.mock.calls[0][0];

          // Verify nuxtClientOptions are merged into browserOptions
          expect(browserOptions.attachProps).toBe(false);
          expect(browserOptions.attachErrorHandler).toBe(false);

          // Verify siblingOptions are not in browserOptions
          expect(browserOptions.siblingOptions).toBeUndefined();

          resolve();
        }, 0);
      });
    });

    test('nuxtClientOptions override vueOptions when both are provided', () => {
      NATIVE.platform = 'web';
      const mockApp = { config: {} } as any;
      const mockOriginalInit = jest.fn();

      init({
        dsn: 'test-dsn',
        enabled: true,
        siblingOptions: {
          vueOptions: {
            app: mockApp,
            attachProps: true,
            attachErrorHandler: true,
          },
          nuxtClientOptions: {
            attachProps: false,
            attachErrorHandler: false,
          },
        },
      }, mockOriginalInit);

      // Wait for async operations
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockOriginalInit).toHaveBeenCalled();
          const browserOptions = mockOriginalInit.mock.calls[0][0];

          // Verify nuxtClientOptions override vueOptions (merged after)
          // app property should still be present from vueOptions
          expect(browserOptions.app).toBe(mockApp);
          // But attachProps and attachErrorHandler are overridden by nuxtClientOptions
          expect(browserOptions.attachProps).toBe(false);
          expect(browserOptions.attachErrorHandler).toBe(false);

          resolve();
        }, 0);
      });
    });

    test('siblingOptions are excluded from nativeOptions', () => {
      NATIVE.platform = 'ios';
      const mockOriginalInit = jest.fn();

      init({
        dsn: 'test-dsn',
        enabled: true,
        siblingOptions: {
          vueOptions: {
            attachProps: false,
            attachErrorHandler: true,
          },
        },
      }, mockOriginalInit);

      // Wait for async operations
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(NATIVE.initNativeSdk).toHaveBeenCalled();
          const nativeOptions = (NATIVE.initNativeSdk as jest.Mock).mock.calls[0][0];

          // Verify siblingOptions are not in nativeOptions
          expect(nativeOptions.siblingOptions).toBeUndefined();
          expect(nativeOptions.vueOptions).toBeUndefined();
          expect(nativeOptions.nuxtClientOptions).toBeUndefined();

          resolve();
        }, 0);
      });
    });
  });
});
