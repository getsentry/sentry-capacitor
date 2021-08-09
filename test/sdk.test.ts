import { CapacitorOptions } from '../src';
import { DEFAULT_OPTIONS_MOBILE, DEFAULT_OPTIONS_WEB, init } from '../src/sdk';
import { NATIVE } from '../src/wrapper';

jest.mock('../src/wrapper', () => {
  return {
    NATIVE: {
      platform: 'web',
      initNativeSdk: jest.fn(),
    },
  };
});

describe('SDK Init', () => {
  it('Uses default web options on web', () => {
    NATIVE.platform = 'web';

    init({ dsn: '' }, (finalOptions: CapacitorOptions) => {
      expect(finalOptions.enableNative).toBe(false);
      expect(finalOptions).toEqual(
        expect.objectContaining(DEFAULT_OPTIONS_WEB),
      );
    });
  });

  it('Uses default mobile options on ios', () => {
    NATIVE.platform = 'ios';

    init({ dsn: '' }, (finalOptions: CapacitorOptions) => {
      expect(finalOptions).toEqual(
        expect.objectContaining(DEFAULT_OPTIONS_MOBILE),
      );
    });
  });

  it('Uses default mobile options on android', () => {
    NATIVE.platform = 'android';

    init({ dsn: '' }, (finalOptions: CapacitorOptions) => {
      expect(finalOptions).toEqual(
        expect.objectContaining(DEFAULT_OPTIONS_MOBILE),
      );
    });
  });
});
