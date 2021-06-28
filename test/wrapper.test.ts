/* eslint-disable @typescript-eslint/unbound-method */
import { Severity } from '@sentry/types';
import { logger } from '@sentry/utils';

import { NATIVE } from '../src/wrapper';

jest.mock(
  '@capacitor/core',
  () => {
    const original = jest.requireActual('@capacitor/core');

    return {
      WebPlugin: original.WebPlugin,
      registerPlugin: jest.fn(),
      Capacitor: {
        isPluginAvailable: jest.fn(() => true),
        getPlatform: jest.fn(() => 'android'),
      },
    };
  },
  /* virtual allows us to mock modules that aren't in package.json */
  { virtual: true },
);

jest.mock('../src/plugin', () => {
  return {
    SentryCapacitor: {
      addBreadcrumb: jest.fn(),
      captureEnvelope: jest.fn(envelope => Promise.resolve(envelope)),
      crash: jest.fn(),
      fetchNativeRelease: jest.fn(() =>
        Promise.resolve({
          build: '0.0.1',
          id: 'test-mock',
          version: '0.0.1',
        }),
      ),
      getStringBytesLength: jest.fn(() => Promise.resolve({ value: 1 })),
      setUser: jest.fn(() => {
        return;
      }),
      initNativeSdk: jest.fn(options => Promise.resolve(options)),
    },
  };
});

import { SentryCapacitor } from '../src/plugin';

beforeEach(() => {
  NATIVE.enableNative = true;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Tests Native Wrapper', () => {
  describe('initNativeSdk', () => {
    test('calls plugin', async () => {
      SentryCapacitor.initNativeSdk = jest.fn();

      await NATIVE.initNativeSdk({ dsn: 'test', enableNative: true });

      expect(SentryCapacitor.initNativeSdk).toBeCalled();
    });

    test('warns if there is no dsn', async () => {
      SentryCapacitor.initNativeSdk = jest.fn();
      logger.warn = jest.fn();

      await NATIVE.initNativeSdk({ enableNative: true });

      expect(SentryCapacitor.initNativeSdk).not.toBeCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.warn).toHaveBeenLastCalledWith(
        'Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.',
      );
    });

    test('does not call native module with enableNative: false', async () => {
      SentryCapacitor.initNativeSdk = jest.fn();
      logger.warn = jest.fn();

      await NATIVE.initNativeSdk({
        dsn: 'test',
        enableNative: false,
        enableNativeNagger: true,
      });

      expect(SentryCapacitor.initNativeSdk).not.toBeCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.warn).toHaveBeenLastCalledWith(
        'Note: Native Sentry SDK is disabled.',
      );
    });
  });

  describe('sendEvent', () => {
    test('calls getStringBytesLength and captureEnvelope', async () => {
      const event = {
        event_id: 'event0',
        message: 'test',
        sdk: {
          name: 'test-sdk-name',
          version: '1.2.3',
        },
      };

      const payload = JSON.stringify({
        ...event,
        message: {
          message: event.message,
        },
      });

      const header = JSON.stringify({
        event_id: event.event_id,
        sdk: event.sdk,
      });

      const item = JSON.stringify({
        content_type: 'application/json',
        length: 99,
        type: 'event',
      });

      const response = {
        envelope: `${header}\n${item}\n${payload}`,
      };

      await expect(NATIVE.sendEvent(event)).resolves.toMatchObject(response);
    });

    test('does not call Capacitor at all if enableNative is false', async () => {
      try {
        await NATIVE.initNativeSdk({ dsn: 'test-dsn', enableNative: false });
        await NATIVE.sendEvent({});
      } catch (error) {
        expect(error.message).toMatch('Native is disabled');
      }

      expect(SentryCapacitor.getStringBytesLength).not.toBeCalled();
      expect(SentryCapacitor.captureEnvelope).not.toBeCalled();
    });
  });

  // TODO add this in when fetchRelease method is in progress
  // describe("fetchRelease", () => {
  //   test("fetches the release from native", async () => {
  //     await expect(NATIVE.fetchRelease()).resolves.toMatchObject({
  //       build: '0.0.1',
  //       id: 'test-mock',
  //       version: '0.0.1',
  //     });
  //   });
  // });

  describe('isModuleLoaded', () => {
    test('returns true when module is loaded', () => {
      expect(NATIVE.isModuleLoaded()).toBe(true);
    });
  });

  describe('crash', () => {
    test('calls the native crash', () => {
      NATIVE.crash();

      expect(SentryCapacitor.crash).toBeCalled();
    });
  });

  describe('setUser', () => {
    test('serializes all user object keys', async () => {
      NATIVE.setUser({
        email: 'hello@sentry.io',
        // @ts-ignore Intentional incorrect type to simulate using a double as an id (We had a user open an issue because this didn't work before)
        id: '3.1234587',
        unique: '123',
      });

      expect(SentryCapacitor.setUser).toBeCalledWith(
        {
          email: 'hello@sentry.io',
          id: '3.1234587',
        },
        {
          unique: '123',
        },
      );
    });

    test('calls native setUser with empty object as second param if no unique keys', async () => {
      NATIVE.setUser({
        id: 'Hello',
      });

      expect(SentryCapacitor.setUser).toBeCalledWith(
        {
          id: 'Hello',
        },
        {},
      );
    });
  });

  describe('_processLevel', () => {
    test('converts deprecated levels', () => {
      expect(NATIVE._processLevel(Severity.Log)).toBe(Severity.Debug);
      expect(NATIVE._processLevel(Severity.Critical)).toBe(Severity.Fatal);
    });
    test('returns non-deprecated levels', () => {
      expect(NATIVE._processLevel(Severity.Debug)).toBe(Severity.Debug);
      expect(NATIVE._processLevel(Severity.Fatal)).toBe(Severity.Fatal);
      expect(NATIVE._processLevel(Severity.Info)).toBe(Severity.Info);
      expect(NATIVE._processLevel(Severity.Warning)).toBe(Severity.Warning);
      expect(NATIVE._processLevel(Severity.Error)).toBe(Severity.Error);
    });
  });

  describe('isNativeClientAvailable', () => {
    test('checks if native client is available', () => {
      expect(NATIVE.isNativeClientAvailable()).toBe(true);
    });
  });
});
