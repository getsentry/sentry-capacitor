import { Severity } from '@sentry/types';
import { logger } from '@sentry/utils';

import { NATIVE } from '../src/wrapper';

jest.mock(
  '@capacitor/core',
  () => ({
    Capacitor: {
      isPluginAvailable: jest.fn(() => true),
    },
    Plugins: {
      SentryCapacitor: {
        addBreadcrumb: jest.fn(),
        captureEnvelope: jest.fn(envelope => Promise.resolve(envelope)),
        crash: jest.fn(),
        fetchRelease: jest.fn(() => {
          Promise.resolve({
            build: '0.0.1',
            id: 'test-mock',
            version: '0.0.1',
          });
        }),
        getStringBytesLength: jest.fn(() => Promise.resolve({ value: 1 })),
        sendEvent: jest.fn(() => Promise.resolve()),
        setUser: jest.fn(() => {
          return;
        }),
        startWithOptions: jest.fn(options => Promise.resolve(options)),
      },
    },
  }),
  /* virtual allows us to mock modules that aren't in package.json */
  { virtual: true },
);

beforeEach(() => {
  NATIVE.enableNative = true;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Tests Native Wrapper', () => {
  describe('startWithOptions', () => {
    test('calls plugin', async () => {
      const Capacitor = require('@capacitor/core');

      Capacitor.Plugins.SentryCapacitor.startWithOptions = jest.fn();

      await NATIVE.startWithOptions({ dsn: 'test', enableNative: true });

      expect(Capacitor.Plugins.SentryCapacitor.startWithOptions).toBeCalled();
    });

    test('warns if there is no dsn', async () => {
      const Capacitor = require('@capacitor/core');

      Capacitor.Plugins.SentryCapacitor.startWithOptions = jest.fn();
      logger.warn = jest.fn();

      await NATIVE.startWithOptions({ enableNative: true });

      expect(
        Capacitor.Plugins.SentryCapacitor.startWithOptions,
      ).not.toBeCalled();
      expect(logger.warn).toHaveBeenLastCalledWith(
        'Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.',
      );
    });

    test('does not call native module with enableNative: false', async () => {
      const Capacitor = require('@capacitor/core');

      Capacitor.Plugins.SentryCapacitor.startWithOptions = jest.fn();
      logger.warn = jest.fn();

      await NATIVE.startWithOptions({
        dsn: 'test',
        enableNative: false,
        enableNativeNagger: true,
      });

      expect(
        Capacitor.Plugins.SentryCapacitor.startWithOptions,
      ).not.toBeCalled();
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
        type: 'event',
      });

      const header = JSON.stringify({
        event_id: event.event_id,
        sdk: event.sdk,
      });

      const item = JSON.stringify({
        content_type: 'application/json',
        length: 114,
        type: 'event',
      });

      const response = {
        envelope: `${header}\n${item}\n${payload}`,
      };

      await expect(NATIVE.sendEvent(event)).resolves.toMatchObject(response);
    });

    test('does not call Capacitor at all if enableNative is false', async () => {
      const Capacitor = require('@capacitor/core');

      try {
        await NATIVE.startWithOptions({ dsn: 'test-dsn', enableNative: false });
        await NATIVE.sendEvent({});
      } catch (error) {
        expect(error.message).toMatch('Native is disabled');
      }

      expect(Capacitor.Plugins.SentryCapacitor.sendEvent).not.toBeCalled();
      expect(
        Capacitor.Plugins.SentryCapacitor.getStringBytesLength,
      ).not.toBeCalled();
      expect(
        Capacitor.Plugins.SentryCapacitor.captureEnvelope,
      ).not.toBeCalled();
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
      const Capacitor = require('@capacitor/core');

      NATIVE.crash();

      expect(Capacitor.Plugins.SentryCapacitor.crash).toBeCalled();
    });
  });

  // TODO uncomment this when in progress of creating setUser functionality
  // describe('setUser', () => {
  //   test('serializes all user object keys', async () => {
  //     const Capacitor = require('@capacitor/core');

  //     NATIVE.setUser({
  //       email: 'hello@sentry.io',
  //       // @ts-ignore Intentional incorrect type to simulate using a double as an id (We had a user open an issue because this didn't work before)
  //       id: 3.1234587,
  //       unique: 123,
  //     });

  //     expect(Capacitor.Plugins.SentryCapacitor.setUser).toBeCalledWith(
  //       {
  //         email: 'hello@sentry.io',
  //         id: 3.1234587,
  //       },
  //       {
  //         unique: 123,
  //       },
  //     );
  //   });

  //   test('calls native setUser with empty object as second param if no unique keys', async () => {
  //     const Capacitor = require('@capacitor/core');

  //     NATIVE.setUser({
  //       id: 'Hello',
  //     });

  //     expect(Capacitor.Plugins.SentryCapacitor.setUser).toBeCalledWith(
  //       {
  //         id: 'Hello',
  //       },
  //       {},
  //     );
  //   });
  // });

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
