import type { BrowserOptions, EventHint, Exception, StackFrame } from '@sentry/browser';
import type { Client, Event } from '@sentry/types';

import type { CapacitorOptions } from '../src';
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
  const table: Array<[
    string,
    string,
    CapacitorOptions & BrowserOptions,
    boolean,
    {
      enableNative: boolean;
      enableAutoSessionTracking: boolean;
    },
  ]> = [
      [
        'Uses default options on web',
        'web',
        { dsn: '' },
        true,
        {
          enableNative: false,
          enableAutoSessionTracking: false,
        },
      ],
      [
        'Uses default options on ios',
        'ios',
        { dsn: '' },
        false,
        {
          enableNative: true,
          enableAutoSessionTracking: true,
        },
      ],
      [
        'Uses default options on android',
        'android',
        { dsn: '' },
        false,
        {
          enableNative: true,
          enableAutoSessionTracking: true,
        },
      ],
      [
        'enableAutoSessionTracking sets autoSessionTracking on web',
        'web',
        { dsn: '', enableAutoSessionTracking: false },
        false,
        {
          enableNative: false,
          enableAutoSessionTracking: false,
        },
      ],
      [
        'enableAutoSessionTracking sets enableAutoSessionTracking on android',
        'android',
        { dsn: '', enableAutoSessionTracking: false },
        false,
        {
          enableNative: true,
          enableAutoSessionTracking: false,
        },
      ],
      [
        'enableAutoSessionTracking sets enableAutoSessionTracking on ios',
        'ios',
        { dsn: '', enableAutoSessionTracking: false },
        false,
        {
          enableNative: true,
          enableAutoSessionTracking: false,
        },
      ],
    ];

  it.each(table)('%s', (...test) => {
    NATIVE.platform = test[1];

    init(test[2], (browserOptions: BrowserOptions) => {
      expect(browserOptions.autoSessionTracking).toBe(test[3]);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NATIVE.initNativeSdk).toHaveBeenCalledWith(
      expect.objectContaining(test[4]),
    );
  });


  test('Does not Enable Native SDK if enabled is false', async () => {
    NATIVE.platform = 'ios';

    init({
      enabled: false
    }, (capacitorOptions: CapacitorOptions) => {
      expect(capacitorOptions.enableNative).toBe(false);
      expect(capacitorOptions.enableNativeNagger).toBe(false);
    });
  });

  test('Keep enableNative if set on mobile', async () => {
    NATIVE.platform = 'ios';

    init({
      enabled: true,
      enableNative: false
    }, (capacitorOptions: CapacitorOptions) => {
      expect(capacitorOptions.enableNative).toBe(false);
      expect(capacitorOptions.enableNativeNagger).toBe(true);
      expect(capacitorOptions.enabled).toBe(true);
    });
  });

  test('Keep enableNativeNagger if set on mobile', async () => {
    NATIVE.platform = 'ios';

    init({
      enabled: true,
      enableNative: false,
      enableNativeNagger: false
    }, (capacitorOptions: CapacitorOptions) => {
      expect(capacitorOptions.enableNative).toBe(false);
      expect(capacitorOptions.enableNativeNagger).toBe(false);
      expect(capacitorOptions.enabled).toBe(true);
    });
  });

  test('WEB has enableNative false by default', async () => {
    NATIVE.platform = 'web';

    init({
      enabled: true,
    }, (capacitorOptions: CapacitorOptions) => {
      expect(capacitorOptions.enableNative).toBe(false);
      expect(capacitorOptions.enableNativeNagger).toBe(false);
      expect(capacitorOptions.enabled).toBe(true);
    });
  });

  test('RewriteFrames to be added by default', async () => {
    NATIVE.platform = 'web';
    init({ enabled: true }, async (capacitorOptions: CapacitorOptions) => {
      const rewriteFramesIntegration =
        Array.isArray(capacitorOptions.integrations) &&
        capacitorOptions.integrations.find(
          (integration) => integration.name === 'RewriteFrames');

      // Capacitor specific frame.
      const error = { values: [{ stacktrace: { frames: [{ filename: 'capacitor://localhost:8080/file.js' }] } }] };
      const expectedError =
      {
        filename: 'app:///file.js',
        in_app: true
      }

      expect(rewriteFramesIntegration).toBeDefined();

      if (rewriteFramesIntegration == false) {
        throw new Error('rewriteFrames should be defined, but it is false');
      }

      // @ts-expect-error
      const event = await rewriteFramesIntegration.processEvent(({ exception: error }) as Event, {} as EventHint, {} as Client);

      const [firstException] = event?.exception?.values as Exception[];
      const [firstFrame] = firstException.stacktrace?.frames as StackFrame[];

      expect(firstFrame).toStrictEqual(expectedError);
    });
  });
});
