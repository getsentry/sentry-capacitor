import type { BrowserOptions, StackFrame} from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import type { Integration } from '@sentry/types';

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
    expect(NATIVE.initNativeSdk).toBeCalledWith(
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

  describe('RewriteFrames tests', () => {
    // [test name, options, assert stack frame, expected stack frame]
    const table: Array<[
      string,
      CapacitorOptions,
      StackFrame,
      StackFrame,
    ]> = [
        [
          'format localhost',
          { dsn: '', enableNative: false },
          { filename: 'http://localhost/file.js' },
          {
            filename: '/file.js',
            in_app: true
          }
        ],
        [
          'format secure localhost',
          { dsn: '', enableNative: false },
          { filename: 'https://localhost/file.js' },
          {
            filename: '/file.js',
            in_app: true
          }
        ],
        [
          'format localhost with port',
          { dsn: '', enableNative: false },
          { filename: 'https://localhost:8080/file.js' },
          {
            filename: '/file.js',
            in_app: true
          }
        ],
        [
          'format ip address',
          { dsn: '', enableNative: false },
          { filename: 'https://127.0.0.1/file.js' },
          {
            filename: 'https://127.0.0.1/file.js',
            in_app: true
          }
        ],        [
          'format ng url',
          { dsn: '', enableNative: false },
          { filename: 'ng://file.js' },
          {
            filename: 'app:///file.js',
            in_app: true
          }
        ],
        [
          'format capacitor',
          { dsn: '', enableNative: false },
          { filename: 'capacitor://localhost:8080/file.js' },
          {
            filename: 'app:///file.js',
            in_app: true
          }
        ],
        [
          'format native code',
          { dsn: '', enableNative: false },
          { filename: '[native code]' },
          {
            filename: '[native code]',
            in_app: false
          }
        ],
        [
          'in_app if js has polyfills',
          { dsn: '', enableNative: false },
          { filename: 'http://localhost/polyfills.js' },
          {
            filename: '/polyfills.js',
            in_app: true
          }
        ],
        [
          'in_app if js has minified polyfills',
          { dsn: '', enableNative: false },
          { filename: 'http://localhost/polyfills.be636cf4b87265b8f6d0.js' },
          {
            filename: '/polyfills.be636cf4b87265b8f6d0.js',
            in_app: true
          }
        ]
      ];

    it.each(table)('%s', (...test) => {
      let integrations = null as Integration[] | null;
      const frame = test[2];
      const expectedFrame = test[3];

      init(test[1], (capacitorOptions: CapacitorOptions) => {
        integrations = capacitorOptions.defaultIntegrations as Integration[] | null;
      });
      // eslint-disable-next-line @typescript-eslint/typedef
      const frameIntegration = integrations?.filter(function (integration) {
        return integration instanceof RewriteFrames;
      })[0] as RewriteFrames;

      frameIntegration.process({
        exception:
          { values: [{ stacktrace: { frames: [frame] } }] }
      });
      expect(frame.filename).toBe(expectedFrame.filename);
      expect(frame.in_app).toBe(expectedFrame.in_app);
    });
  });
});
