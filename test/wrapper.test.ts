/* eslint-disable @typescript-eslint/unbound-method */
import { Severity } from '@sentry/types';
import { logger } from '@sentry/utils';

import { NATIVE } from '../src/wrapper';

let getStringBytesLengthValue = 1;

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
      fetchNativeDeviceContexts: jest.fn(() =>
        Promise.resolve({
          someContext: {
            someValue: 0,
          },
        })
      ),
      getStringBytesLength: jest.fn(() =>
        Promise.resolve({
          value: getStringBytesLengthValue,
        }),
      ),
      initNativeSdk: jest.fn(options => Promise.resolve(options)),
      setContext: jest.fn(() => Promise.resolve()),
      setExtra: jest.fn(() => Promise.resolve()),
      setTag: jest.fn(() => Promise.resolve()),
      setUser: jest.fn(() => {
        return;
      }),
    },
  };
});

import { SentryCapacitor } from '../src/plugin';

beforeEach(() => {
  getStringBytesLengthValue = 1;
  NATIVE.enableNative = true;
  NATIVE.platform = 'android';
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
      const expectedNativeLength = 101;
      getStringBytesLengthValue = expectedNativeLength;

      const event = {
        event_id: 'event0',
        message: 'test©',
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
        length: expectedNativeLength,
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

    test('does not include sdkProcessingMetadata on event sent', async () => {
      const event = {
        event_id: 'event0',
        message: 'test©',
        sdk: {
          name: 'test-sdk-name',
          version: '1.2.3',
        },
        sdkProcessingMetadata: ["uneeeded data.", "xz"]
      };
      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');

      await NATIVE.initNativeSdk({ dsn: 'test-dsn', enableNative: true });
      await NATIVE.sendEvent(event);

      expect(SentryCapacitor.captureEnvelope).toBeCalledTimes(1);
      expect(captureEnvelopeSpy.mock.calls[0][0].envelope).toContain(event.event_id);
      expect(captureEnvelopeSpy.mock.calls[0][0].envelope).not.toContain('sdkProcessingMetadata');
    });

    test("Clears breadcrumbs on Android if there is no exception", async () => {
      NATIVE.platform = "android";

      const event = {
        event_id: "event0",
        message: "test",
        breadcrumbs: [
          {
            message: "crumb!",
          },
        ],
        sdk: {
          name: 'test-sdk-name',
          version: '1.2.3',
        },
      };

      const payload = JSON.stringify({
        ...event,
        breadcrumbs: [],
        message: {
          message: event.message,
        },
      });
      const header = JSON.stringify({
        event_id: event.event_id,
        sdk: event.sdk,
      });
      const item = JSON.stringify({
        content_type: "application/json",
        length: 1,
        type: "event",
      });

      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');

      await NATIVE.sendEvent(event);

      expect(SentryCapacitor.captureEnvelope).toBeCalledTimes(1);
      expect(captureEnvelopeSpy.mock.calls[0][0].envelope).toMatch(
        `${header}\n${item}\n${payload}`);
    });

    test("Clears breadcrumbs on Android if there is a handled exception", async () => {
      NATIVE.platform = "android";

      const event = {
        event_id: "event0",
        message: "test",
        breadcrumbs: [
          {
            message: "crumb!",
          },
        ],
        exception: {
          values: [{
            mechanism: {
              handled: true
            }
          }]
        },
        sdk: {
          name: 'test-sdk-name',
          version: '1.2.3',
        },
      };

      const payload = JSON.stringify({
        ...event,
        breadcrumbs: [],
        message: {
          message: event.message,
        },
        exception: {
          values: [{
            mechanism: {
              handled: true
            }
          }]
        }
      });
      const header = JSON.stringify({
        event_id: event.event_id,
        sdk: event.sdk,
      });
      const item = JSON.stringify({
        content_type: "application/json",
        length: 1,
        type: "event",
      });

      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');

      await NATIVE.sendEvent(event);

      expect(SentryCapacitor.captureEnvelope).toBeCalledTimes(1);
      expect(captureEnvelopeSpy.mock.calls[0][0].envelope).toMatch(
        `${header}\n${item}\n${payload}`);
    });

    test("Clears breadcrumbs on Android if there is a handled exception", async () => {
      NATIVE.platform = "android";

      const event = {
        event_id: "event0",
        message: "test",
        breadcrumbs: [
          {
            message: "crumb!",
          },
        ],
        exception: {
          values: [{
            mechanism: {
              handled: false
            }
          }]
        },
        sdk: {
          name: 'test-sdk-name',
          version: '1.2.3',
        },
      };

      const payload = JSON.stringify({
        ...event,
        breadcrumbs: [
          {
            message: "crumb!",
          },
        ],
        message: {
          message: event.message,
        },
        exception: {
          values: [{
            mechanism: {
              handled: false
            }
          }]
        }
      });
      const header = JSON.stringify({
        event_id: event.event_id,
        sdk: event.sdk,
      });
      const item = JSON.stringify({
        content_type: "application/json",
        length: 1,
        type: "event",
      });

      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');

      await NATIVE.sendEvent(event);

      expect(SentryCapacitor.captureEnvelope).toBeCalledTimes(1);
      expect(captureEnvelopeSpy.mock.calls[0][0].envelope).toMatch(
        `${header}\n${item}\n${payload}`);
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

      expect(SentryCapacitor.setUser).toBeCalledWith({
        defaultUserKeys: {
          email: 'hello@sentry.io',
          id: '3.1234587',
        },
        otherUserKeys: {
          unique: '123',
        },
      });
    });

    test('calls native setUser with empty object as second param if no unique keys', async () => {
      NATIVE.setUser({
        id: 'Hello',
      });

      expect(SentryCapacitor.setUser).toBeCalledWith({
        defaultUserKeys: {
          id: 'Hello',
        },
        otherUserKeys: {},
      });
    });
  });

  describe('setTag', () => {
    it('calls setTag', () => {
      NATIVE.setTag('key', 'value');

      expect(SentryCapacitor.setTag).toBeCalledWith({
        key: 'key',
        value: 'value',
      });
    });

    it('serializes number', () => {
      // @ts-ignore test number
      NATIVE.setTag('key', 0);

      expect(SentryCapacitor.setTag).toBeCalledWith({
        key: 'key',
        value: '0',
      });
    });

    it('serializes object', () => {
      // @ts-ignore test number
      NATIVE.setTag('key', {});

      expect(SentryCapacitor.setTag).toBeCalledWith({
        key: 'key',
        value: '{}',
      });
    });
  });

  describe('setExtra', () => {
    it('calls setExtra', () => {
      NATIVE.setExtra('key', { hello: 'world' });

      expect(SentryCapacitor.setExtra).toBeCalledWith({
        key: 'key',
        value: '{"hello":"world"}',
      });
    });
  });

  describe('setContext', () => {
    it('calls setContext', () => {
      NATIVE.platform = 'ios';

      NATIVE.setContext('key', { hello: 'world' });

      expect(SentryCapacitor.setContext).toBeCalledWith({
        key: 'key',
        value: { hello: 'world' },
      });
    });

    it('calls setContext with null', () => {
      NATIVE.platform = 'ios';

      NATIVE.setContext('key', null);

      expect(SentryCapacitor.setContext).toBeCalledWith({
        key: 'key',
        value: null,
      });
    });

    it('calls setExtra on android', () => {
      NATIVE.platform = 'android';

      NATIVE.setContext('key', { hello: 'world' });

      expect(SentryCapacitor.setExtra).toBeCalledWith({
        key: 'key',
        value: '{"hello":"world"}',
      });
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

  describe('deviceContexts', () => {
    test('returns context object from native module on ios', async () => {
      NATIVE.platform = 'ios';

      await expect(NATIVE.fetchNativeDeviceContexts()).resolves.toMatchObject({
        someContext: {
          someValue: 0,
        },
      });

      expect(SentryCapacitor.fetchNativeDeviceContexts).toBeCalled();
    });
    test('returns empty object on android', async () => {
      NATIVE.platform = 'android';

      await expect(NATIVE.fetchNativeDeviceContexts()).resolves.toMatchObject(
        {}
      );

      expect(SentryCapacitor.fetchNativeDeviceContexts).not.toBeCalled();
    });
  });
});
