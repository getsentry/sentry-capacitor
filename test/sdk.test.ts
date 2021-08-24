import { BrowserOptions } from '@sentry/browser';

import { CapacitorOptions } from '../src';
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
});
