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
    boolean,
    boolean,
  ]> = [
    ['Uses default options on web', 'web', { dsn: '' }, true, false, false],
    ['Uses default options on ios', 'ios', { dsn: '' }, false, true, true],
    [
      'Uses default options on android',
      'android',
      { dsn: '' },
      false,
      true,
      true,
    ],
    [
      'enableAutoSessionTracking sets autoSessionTracking on web',
      'web',
      { dsn: '', enableAutoSessionTracking: false },
      false,
      false,
      false,
    ],
    [
      'enableAutoSessionTracking sets enableAutoSessionTracking on android',
      'android',
      { dsn: '', enableAutoSessionTracking: false },
      false,
      true,
      false,
    ],
    [
      'enableAutoSessionTracking sets enableAutoSessionTracking on ios',
      'ios',
      { dsn: '', enableAutoSessionTracking: false },
      false,
      true,
      false,
    ],
  ];

  it.each(table)('%s', (...test) => {
    NATIVE.platform = test[1];

    init(test[2], (browserOptions: BrowserOptions) => {
      expect(browserOptions.autoSessionTracking).toBe(test[3]);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NATIVE.initNativeSdk).toBeCalledWith(
      expect.objectContaining({
        enableNative: test[4],
        enableAutoSessionTracking: test[5],
      }),
    );
  });
});
