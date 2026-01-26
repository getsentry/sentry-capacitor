/* eslint-disable @typescript-eslint/unbound-method */
import type { Envelope, EventEnvelope, EventItem, SeverityLevel, TransportMakeRequestResponse } from '@sentry/core';
import { createEnvelope, debug, dropUndefinedKeys } from '@sentry/core';
import { utf8ToBytes } from '../src/vendor';
import { base64EnvelopeToString, createLogEnvelopeHelper, createMetricEnvelopeHelper } from './helper/envelopeHelper';

let getStringBytesLengthValue = 1;

// Use shared mock to avoid conflicts
import { setupCapacitorMock } from './mocks/capacitor';

setupCapacitorMock();

// Mock the plugin before importing wrapper
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
      fetchNativeLogAttributes: jest.fn(() =>
        Promise.resolve({
          contexts: {
            device: {
              brand: 'test-brand',
              model: 'test-model',
              family: 'test-family',
            },
            os: {
              name: 'test-os',
              version: '1.0.0',
            },
          },
          release: 'test-release',
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
      closeNativeSdk: jest.fn(() => Promise.resolve()),
      pauseAppHangTracking: jest.fn(() => Promise.resolve()),
      resumeAppHangTracking: jest.fn(() => Promise.resolve()),
    },
  };
});

// Now import after mocks are set up
import { Capacitor } from '@capacitor/core';
import { SentryCapacitor } from '../src/plugin';
import { base64StringFromByteArray } from '../src/vendor/fromByteArray';
import { NATIVE } from '../src/wrapper';

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

      expect(SentryCapacitor.initNativeSdk).toHaveBeenCalled();
    });

    test('Vue and App options to be removed', async () => {

      const initNativeSdk = jest.spyOn(SentryCapacitor, 'initNativeSdk');

      // @ts-ignore ignore app and vue since they are part of Sentry/Vue and not Capacitor.
      await NATIVE.initNativeSdk({ dsn: 'test', enableNative: true, app: 'test', vue: 'test' });

      const nativeOption = initNativeSdk.mock.calls[0]?.[0]?.options;
      expect(SentryCapacitor.initNativeSdk).toHaveBeenCalledTimes(1);
      // @ts-ignore Not part of Capacitor Options but it is extended by Vue Options.
      expect(nativeOption.app).toBeUndefined();
      // @ts-ignore Not part of Capacitor Options but it is extended by Vue Options.
      expect(nativeOption.vue).toBeUndefined();

      expect(initNativeSdk).toHaveBeenCalled();
    });


    test('default options to be removed', async () => {
      const initNativeSdk = jest.spyOn(SentryCapacitor, 'initNativeSdk');
      await NATIVE.initNativeSdk(
        {
          dsn: 'test',
          enableNative: true,
          integrations: [],
          defaultIntegrations: [],
          beforeSend: ((event) => event),
          beforeBreadcrumb: ((breadcrumb) => breadcrumb),
          beforeSendTransaction: (transaction) => transaction,
          transport: jest.fn(),
          tracesSampler: jest.fn(),
        });

      const nativeOption = initNativeSdk.mock.calls[0]?.[0]?.options;
      expect(SentryCapacitor.initNativeSdk).toHaveBeenCalledTimes(1);
      // @ts-ignore Not part of Capacitor Options but it is extended by Vue Options.
      expect(nativeOption?.integrations).toBeUndefined();
      expect(nativeOption?.defaultIntegrations).toBeUndefined();
      expect(nativeOption?.beforeSend).toBeUndefined();
      expect(nativeOption?.beforeSendTransaction).toBeUndefined();
      expect(nativeOption?.beforeBreadcrumb).toBeUndefined();
      expect(nativeOption?.transport).toBeUndefined();
      expect(nativeOption?.tracesSampler).toBeUndefined();

      expect(initNativeSdk).toHaveBeenCalled();
    });

    test('warns if there is no dsn', async () => {
      SentryCapacitor.initNativeSdk = jest.fn();
      debug.warn = jest.fn();

      await NATIVE.initNativeSdk({ enableNative: true });

      expect(SentryCapacitor.initNativeSdk).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(debug.warn).toHaveBeenLastCalledWith(
        'Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.',
      );
    });

    test('does not call native module with enableNative: false', async () => {
      SentryCapacitor.initNativeSdk = jest.fn();
      debug.warn = jest.fn();

      await NATIVE.initNativeSdk({
        dsn: 'test',
        enableNative: false,
        enableNativeNagger: true,
      });

      expect(SentryCapacitor.initNativeSdk).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(debug.warn).toHaveBeenLastCalledWith(
        'Note: Native Sentry SDK is disabled.',
      );
    });

    test('sets enableNative: false when dsn is undefined', async () => {
      await NATIVE.initNativeSdk({
        dsn: undefined,
      });

      expect(NATIVE.enableNative).toBe(false);
    });
  });

  describe('sendEnvelope', () => {
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

      const expectedHeader = JSON.stringify({
        event_id: event.event_id,
        sent_at: '123'
      });
      const expectedItem = JSON.stringify({
        type: 'event',
        content_type: 'application/json',
        length: expectedNativeLength,
      });
      const expectedPayload = JSON.stringify({
        ...event,
        message: {
          message: event.message,
        },
      });

      const expectedEnvelope = `${expectedHeader}\n${expectedItem}\n${expectedPayload}\n`;

      const env = createEnvelope<EventEnvelope>({ event_id: event.event_id, sent_at: '123' }, [
        [{ type: 'event' }, event] as EventItem,
      ]);

      await NATIVE.sendEnvelope(env);

      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalledWith({ envelope: base64StringFromByteArray(utf8ToBytes(expectedEnvelope)) });
    });

    test('does not call Capacitor at all if enableNative is false', async () => {
      try {
        await NATIVE.initNativeSdk({ dsn: 'test-dsn', enableNative: false });
        await NATIVE.sendEnvelope({} as Envelope);
      } catch (error) {
        // @ts-ignore it is an error.
        expect(error.message).toMatch('Native is disabled');
      }

      expect(SentryCapacitor.getStringBytesLength).not.toHaveBeenCalled();
      expect(SentryCapacitor.captureEnvelope).not.toHaveBeenCalled();
    });

    test('Has a valid EOF string', async () => {
      const [expectedEOF = -1/* Placeholder */] = utf8ToBytes('\n');
      const expectedEnvelopeBytes = utf8ToBytes(JSON.stringify({ foo: 'bar' }));
      expectedEnvelopeBytes.push(expectedEOF);
      const expectedEnvelopeBase64 = base64StringFromByteArray(expectedEnvelopeBytes);

      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');

      const mockedEnvelope: Envelope = [{ foo: 'bar' }, []];

      await NATIVE.sendEnvelope(mockedEnvelope);

      expect(expectedEOF).not.toBe(-1);
      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalledTimes(1);
      expect(captureEnvelopeSpy.mock.calls[0]?.[0]?.envelope).toEqual(expectedEnvelopeBase64);
    });


    test('has statusCode 200 on success', async () => {
      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');
      captureEnvelopeSpy.mockResolvedValue(true);

      const event = {
        event_id: 'event0',
        message: 'test',
        sdk: {
          name: 'test-sdk-name',
          version: '2.1.3',
        },
      };

      const env = createEnvelope<EventEnvelope>({ event_id: event.event_id, sent_at: '123' }, [
        [{ type: 'event' }, event] as EventItem,
      ]);

      const expectedReturn = {
        statusCode: 200,
      } as TransportMakeRequestResponse;
      NATIVE.enableNative = true;
      const result = await NATIVE.sendEnvelope(env);
      expect(result).toMatchObject(expectedReturn);
    });

    test('has statusCode 500 if failed', async () => {
      const captureEnvelopeSpy = jest.spyOn(SentryCapacitor, 'captureEnvelope');
      captureEnvelopeSpy.mockRejectedValue(false);

      const event = {
        event_id: 'event0',
        message: 'test',
        sdk: {
          name: 'test-sdk-name',
          version: '2.1.3',
        },
      };

      const env = createEnvelope<EventEnvelope>({ event_id: event.event_id, sent_at: '123' }, [
        [{ type: 'event' }, event] as EventItem,
      ]);

      const expectedReturn = {
        statusCode: 500,
      } as TransportMakeRequestResponse;
      NATIVE.enableNative = true;
      const result = await NATIVE.sendEnvelope(env);
      expect(result).toMatchObject(expectedReturn);
    });

    test('uses correct content type for metrics with content_type set', async () => {
      // Create a SerializedMetric array as expected by createMetricEnvelope
      const serializedMetrics = [
        {
          timestamp: 1765200319.505,
          name: 'test.metric.counter',
          value: 1,
          type: 'counter' as const,
          unit: 'none',
          trace_id: '',
        },
      ];

      // Use createMetricEnvelopeHelper to create a properly formatted metric envelope
      const env = createMetricEnvelopeHelper(serializedMetrics);

      await NATIVE.sendEnvelope(env);

      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalled();
      const base64Envelope = (SentryCapacitor.captureEnvelope as jest.Mock).mock.calls[0]?.[0]?.envelope;
      expect(base64Envelope).toBeDefined();
      expect(base64EnvelopeToString(base64Envelope)).toEqual(
        `{}
{"type":"trace_metric","item_count":1,"content_type":"application/vnd.sentry.items.trace-metric+json","length":124}
{"items":[{"timestamp":1765200319.505,"name":"test.metric.counter","value":1,"type":"counter","unit":"none","trace_id":""}]}
`);
    });

    test('uses correct content type for logs with content_type set', async () => {
      // Create a SerializedLog array as expected by createLogEnvelope
      const serializedLogs = [
        {
          timestamp: 1765200551.692,
          level: 'info' as const,
          body: 'test log message',
          severity_number: 9,
          attributes: {},
        },
      ];

      // Use createLogEnvelopeHelper to create a properly formatted log envelope
      const env = createLogEnvelopeHelper(serializedLogs);

      await NATIVE.sendEnvelope(env);

      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalled();
      const base64Envelope = (SentryCapacitor.captureEnvelope as jest.Mock).mock.calls[0]?.[0]?.envelope;
      expect(base64Envelope).toBeDefined();
      expect(base64EnvelopeToString(base64Envelope)).toEqual(
        `{}
{"type":"log","item_count":1,"content_type":"application/vnd.sentry.items.log+json","length":117}
{"items":[{"timestamp":1765200551.692,"level":"info","body":"test log message","severity_number":9,"attributes":{}}]}
`);
    });

    test('respects existing content_type in item header', async () => {
      const expectedNativeLength = 50;
      getStringBytesLengthValue = expectedNativeLength;

      const customItem = {
        custom: 'data',
      };

      // Test with custom content_type - using any to bypass strict typing for test
      const env = [
        { event_id: 'custom0', sent_at: '123' },
        [[{ type: 'log', content_type: 'application/vnd.sentry.items.custom+json' }, customItem]],
      ] as any as Envelope;

      await NATIVE.sendEnvelope(env);

      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalled();
      const base64Envelope = (SentryCapacitor.captureEnvelope as jest.Mock).mock.calls[0]?.[0]?.envelope;
      expect(base64Envelope).toBeDefined();
      expect(base64EnvelopeToString(base64Envelope)).toEqual(
        `{"event_id":"custom0","sent_at":"123"}
{"type":"log","content_type":"application/vnd.sentry.items.custom+json","length":17}
{"custom":"data"}
`);
    });

    test('defaults to application/json when content_type is not set', async () => {
      const expectedNativeLength = 15;
      getStringBytesLengthValue = expectedNativeLength;

      const itemWithoutContentType = {
        some: 'data',
      };

      const expectedHeader = JSON.stringify({
        event_id: 'default0',
        sent_at: '123'
      });
      const expectedItem = JSON.stringify({
        type: 'event',
        content_type: 'application/json',
        length: expectedNativeLength,
      });
      const expectedPayload = JSON.stringify(itemWithoutContentType);

      const expectedEnvelope = `${expectedHeader}\n${expectedItem}\n${expectedPayload}\n`;

      // Test with item that doesn't have content_type set - should default to application/json
      const env = [
        { event_id: 'default0', sent_at: '123' },
        [[{ type: 'event' }, itemWithoutContentType]],
      ] as any as Envelope;

      await NATIVE.sendEnvelope(env);

      expect(SentryCapacitor.captureEnvelope).toHaveBeenCalledWith({ envelope: base64StringFromByteArray(utf8ToBytes(expectedEnvelope)) });
    });
  });

  // TODO add this in when fetchRelease method is in progress
  // describe('fetchRelease', () => {
  //   test('fetches the release from native', async () => {
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

      expect(SentryCapacitor.crash).toHaveBeenCalled();
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

      expect(SentryCapacitor.setUser).toHaveBeenCalledWith({
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

      expect(SentryCapacitor.setUser).toHaveBeenCalledWith({
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

      expect(SentryCapacitor.setTag).toHaveBeenCalledWith({
        key: 'key',
        value: 'value',
      });
    });

    it('serializes number', () => {
      // @ts-ignore test number
      NATIVE.setTag('key', 0);

      expect(SentryCapacitor.setTag).toHaveBeenCalledWith({
        key: 'key',
        value: '0',
      });
    });

    it('serializes object', () => {
      // @ts-ignore test number
      NATIVE.setTag('key', {});

      expect(SentryCapacitor.setTag).toHaveBeenCalledWith({
        key: 'key',
        value: '{}',
      });
    });
  });

  describe('setExtra', () => {
    it('calls setExtra', () => {
      NATIVE.setExtra('key', { hello: 'world' });

      expect(SentryCapacitor.setExtra).toHaveBeenCalledWith({
        key: 'key',
        value: '{"hello":"world"}',
      });
    });
  });

  describe('setContext', () => {
    it('calls setContext', () => {
      NATIVE.platform = 'ios';

      NATIVE.setContext('key', { hello: 'world' });

      expect(SentryCapacitor.setContext).toHaveBeenCalledWith({
        key: 'key',
        value: { hello: 'world' },
      });
    });

    it('calls setContext with null', () => {
      NATIVE.platform = 'ios';

      NATIVE.setContext('key', null);

      expect(SentryCapacitor.setContext).toHaveBeenCalledWith({
        key: 'key',
        value: null,
      });
    });

    it('calls setExtra on android', () => {
      NATIVE.platform = 'android';

      NATIVE.setContext('key', { hello: 'world' });

      expect(SentryCapacitor.setExtra).toHaveBeenCalledWith({
        key: 'key',
        value: '{"hello":"world"}',
      });
    });
  });

  describe('_processLevel', () => {
    test('converts deprecated levels', () => {
      expect(NATIVE._processLevel('log' as SeverityLevel)).toBe('debug' as SeverityLevel);
      expect(NATIVE._processLevel('critical' as SeverityLevel)).toBe('fatal' as SeverityLevel);
    });
    test('returns non-deprecated levels', () => {
      expect(NATIVE._processLevel('debug' as SeverityLevel)).toBe('debug' as SeverityLevel);
      expect(NATIVE._processLevel('fatal' as SeverityLevel)).toBe('fatal' as SeverityLevel);
      expect(NATIVE._processLevel('info' as SeverityLevel)).toBe('info' as SeverityLevel);
      expect(NATIVE._processLevel('warning' as SeverityLevel)).toBe('warning' as SeverityLevel);
      expect(NATIVE._processLevel('error' as SeverityLevel)).toBe('error' as SeverityLevel);
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

      expect(SentryCapacitor.fetchNativeDeviceContexts).toHaveBeenCalled();
    });
  });

  describe('fetchNativeLogAttributes', () => {
    test('returns log attributes from native module', async () => {
      NATIVE.platform = 'ios';
      NATIVE.enableNative = true;

      await expect(NATIVE.fetchNativeLogAttributes()).resolves.toMatchObject({
        contexts: {
          device: {
            brand: 'test-brand',
            model: 'test-model',
            family: 'test-family',
          },
          os: {
            name: 'test-os',
            version: '1.0.0',
          },
        },
        release: 'test-release',
      });

      expect(SentryCapacitor.fetchNativeLogAttributes).toHaveBeenCalled();
    });

    test('throws error when enableNative is false', async () => {
      NATIVE.enableNative = false;

      await expect(NATIVE.fetchNativeLogAttributes()).rejects.toThrow('Native is disabled');
      expect(SentryCapacitor.fetchNativeLogAttributes).not.toHaveBeenCalled();
    });

    test('throws error when native client is not available', async () => {
      NATIVE.enableNative = true;
      const mockIsPluginAvailable = Capacitor.isPluginAvailable as jest.Mock;
      mockIsPluginAvailable.mockReturnValueOnce(false);

      await expect(NATIVE.fetchNativeLogAttributes()).rejects.toThrow(
        "Native Client is not available, can't start on native.",
      );
    });
  });

  describe('closeNativeSdk', () => {
    test('closeNativeSdk calls native bridge', async () => {
      await NATIVE.closeNativeSdk();

      expect(SentryCapacitor.closeNativeSdk).toHaveBeenCalled();
      expect(NATIVE.enableNative).toBe(false);
    });
  });

  describe('_serializeObject', () => {

    test('serializes simple object', () => {

      const data = { valid: true, undefinedKey: undefined, stringData: 'data' };
      const serializedData = NATIVE._serializeObject(data);

      expect(serializedData).toEqual(
        {
          'stringData': 'data',
          'undefinedKey': undefined,
          'valid': 'true'
        });
    });

    test('serializes simple object AND removes undefined values', () => {

      const data = { valid: true, undefinedKey: undefined, stringData: 'data' };
      const serializedData = NATIVE._serializeObject(data, true);

      expect(serializedData).toEqual(
        {
          'stringData': 'data',
          'valid': 'true'
        });
    });

    test('undefined removal behaves the same as dropUndefinedKeys', () => {

      const data = { valid: true, undefinedKey: undefined, stringData: 'data' };
      // eslint-disable-next-line deprecation/deprecation
      const oldSerializedData = dropUndefinedKeys(NATIVE._serializeObject(data));

      const newSerializedData = NATIVE._serializeObject(data, true);

      expect(newSerializedData).toEqual(oldSerializedData);
    });

    test('serializes complex object', () => {

      const subData = { data1: 1, data2: 2, undefinedData: undefined, data3: { dataA: 'A', dataB: 0.9 } };
      const data = { valid: true, undefinedKey: undefined, stringData: 'data', subData: subData };
      const serializedData = NATIVE._serializeObject(data);

      expect(serializedData).toEqual(
        {
          'stringData': 'data',
          'subData': '{"data1":1,"data2":2,"data3":{"dataA":"A","dataB":0.9}}',
          'undefinedKey': undefined,
          'valid': 'true'
        });

    });

    test('serializes complex object AND removes undefined values', () => {

      const subData = { data1: 1, data2: 2, undefinedData: undefined, data3: { dataA: 'A', dataB: 0.9 } };
      const data = { valid: true, undefinedKey: undefined, stringData: 'data', subData: subData };
      const serializedData = NATIVE._serializeObject(data, true);

      expect(serializedData).toEqual(
        {
          'stringData': 'data',
          'subData': '{"data1":1,"data2":2,"data3":{"dataA":"A","dataB":0.9}}',
          'valid': 'true'
        });
    });

  });

  describe('pauseAppHangTracking', () => {
    test('calls native pauseAppHangTracking on iOS', () => {
      NATIVE.platform = 'ios';
      NATIVE.enableNative = true;

      NATIVE.pauseAppHangTracking();

      expect(SentryCapacitor.pauseAppHangTracking).toHaveBeenCalled();
    });

    test('does not call native pauseAppHangTracking on Android', () => {
      NATIVE.platform = 'android';
      NATIVE.enableNative = true;

      NATIVE.pauseAppHangTracking();

      expect(SentryCapacitor.pauseAppHangTracking).not.toHaveBeenCalled();
    });

    test('throws error when native client is not available', () => {
      NATIVE.enableNative = true;
      NATIVE.platform = 'ios';

      const mockIsPluginAvailable = Capacitor.isPluginAvailable as jest.Mock;
      mockIsPluginAvailable.mockReturnValueOnce(false);

      expect(() => NATIVE.pauseAppHangTracking()).toThrow('Native Client is not available, can\'t start on native.');
    });

    test('does nothing when enableNative is false', () => {
      NATIVE.enableNative = false;
      NATIVE.platform = 'ios';

      NATIVE.pauseAppHangTracking();

      expect(SentryCapacitor.pauseAppHangTracking).not.toHaveBeenCalled();
    });
  });

  describe('resumeAppHangTracking', () => {
    test('calls native resumeAppHangTracking on iOS', () => {
      NATIVE.platform = 'ios';
      NATIVE.enableNative = true;

      NATIVE.resumeAppHangTracking();

      expect(SentryCapacitor.resumeAppHangTracking).toHaveBeenCalled();
    });

    test('does not call native resumeAppHangTracking on Android', () => {
      NATIVE.platform = 'android';
      NATIVE.enableNative = true;

      NATIVE.resumeAppHangTracking();

      expect(SentryCapacitor.resumeAppHangTracking).not.toHaveBeenCalled();
    });

    test('throws error when native client is not available', () => {
      NATIVE.enableNative = true;
      NATIVE.platform = 'ios';

      const mockIsPluginAvailable = Capacitor.isPluginAvailable as jest.Mock;
      mockIsPluginAvailable.mockReturnValueOnce(false);

      expect(() => NATIVE.resumeAppHangTracking()).toThrow('Native Client is not available, can\'t start on native.');
    });

    test('does nothing when enableNative is false', () => {
      NATIVE.enableNative = false;
      NATIVE.platform = 'ios';

      NATIVE.resumeAppHangTracking();

      expect(SentryCapacitor.resumeAppHangTracking).not.toHaveBeenCalled();
    });
  });

  test('closeNativeSdk called twice does not throw error.', async () => {
    debug.log = jest.fn();
    await NATIVE.closeNativeSdk();
    expect(debug.log).not.toHaveBeenCalled();

    await NATIVE.closeNativeSdk();
    expect(debug.log).toHaveBeenCalledWith(NATIVE._DisabledNativeError);
  });
});
