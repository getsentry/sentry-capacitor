import type { Envelope, Transport } from '@sentry/types';

import { CapacitorClient } from '../src/client';
import type { CapacitorClientOptions } from '../src/options';
import { NativeTransport } from '../src/transports/native';
import { NATIVE } from '../src/wrapper';

interface MockedCapacitor {
  Platform: {
    OS: 'mock';
  };
  Capacitor: {
    isPluginAvailable: jest.Mock,
    getPlatform: jest.Mock,
    crash: jest.Mock;
    captureEnvelope: jest.Mock;
},
}

jest.mock(
  '@capacitor/core',
  (): MockedCapacitor => ({
    Platform: {
      OS: 'mock',
    },
    Capacitor: {
      isPluginAvailable: jest.fn(() => true),
      getPlatform: jest.fn(() => 'android'),
      crash: jest.fn(),
      captureEnvelope: jest.fn(),
  },
  }),
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
          value: 1,
        }),
      ),
      initNativeSdk: jest.fn(() => Promise.resolve(true)),
      setContext: jest.fn(() => Promise.resolve()),
      setExtra: jest.fn(() => Promise.resolve()),
      setTag: jest.fn(() => Promise.resolve()),
      setUser: jest.fn(() => {
        return;
      }),
    },
  };
});

import * as Plugin from '../src/plugin';


const EXAMPLE_DSN = 'https://6890c2f6677340daa4804f8194804ea2@o19635.ingest.sentry.io/148053';

const DEFAULT_OPTIONS: CapacitorClientOptions = {
  enableNative: true,
  enableNativeCrashHandling: true,
  enableNativeNagger: true,
  enableWatchdogTerminationTracking: true,
  integrations: [],
  transport: () => ({
    send: jest.fn(),
    flush: jest.fn(),
  }),
  stackParser: jest.fn().mockReturnValue([]),
};

describe('Tests CapacitorClient', () => {
  describe('initializing the client', () => {
    test('client initializes', async () => {
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => new NativeTransport(),
      });

      await expect(client.eventFromMessage('test')).resolves.toBeDefined();
    });

    /* TODO: Fix defaultSDK Info
    test('invalid dsn is thrown', () => {
      try {
        new CapacitorClient({
          ...DEFAULT_OPTIONS,
          dsn: 'not a dsn',
          transport: () => new NativeTransport(),
        });
      } catch (e: any) {
        expect(e.message).toBe('Invalid Sentry Dsn: not a dsn');
      }
    });
*/
    test("undefined dsn doesn't crash", () => {
      expect(() => {
        const backend = new CapacitorClient({
          ...DEFAULT_OPTIONS,
          dsn: undefined,
          transport: () => new NativeTransport(),
        });

        return expect(backend.eventFromMessage('test')).resolves.toBeDefined();
      }).not.toThrow();
    });

    test('use custom transport function', async () => {
      const mySend = (_request: Envelope) => Promise.resolve();
      const myFlush = (timeout?: number) => Promise.resolve(Boolean(timeout));
      const myCustomTransportFn = (): Transport => ({
        send: mySend,
        flush: myFlush,
      });
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: myCustomTransportFn,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.getTransport()?.flush).toBe(myFlush);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.getTransport()?.send).toBe(mySend);
    });
  });

  describe('onReady', () => {
    test('calls onReady callback with true if Native SDK is initialized', done => {
      new CapacitorClient(
        mockedOptions({
          dsn: EXAMPLE_DSN,
          enableNative: true,
          onReady: ({ didCallNativeInit }) => {
            expect(didCallNativeInit).toBe(true);

            done();
          },
          transport: () => new NativeTransport(),
        }),
      );
    });

    test('calls onReady callback with false if Native SDK was not initialized', done => {
      new CapacitorClient(
        mockedOptions({
          dsn: EXAMPLE_DSN,
          enableNative: false,
          onReady: ({ didCallNativeInit }) => {
            expect(didCallNativeInit).toBe(false);

            done();
          },
          transport: () => new NativeTransport(),
        }),
      );
    });

    test('calls onReady callback with false if Native SDK failed to initialize', done => {
      Plugin.SentryCapacitor.initNativeSdk = jest.fn(() => {
        throw new Error();
      });

      new CapacitorClient(
        mockedOptions({
          dsn: EXAMPLE_DSN,
          enableNative: true,
          onReady: ({ didCallNativeInit }) => {
            expect(didCallNativeInit).toBe(false);

            done();
          },
          transport: () => new NativeTransport(),
        }),
      );
    });
  });

  describe('nativeCrash', () => {
    test('calls NativeModules crash', () => {
      NATIVE.enableNative = true;

      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        enableNative: true,
        transport: () => new NativeTransport(),
      });
      client.nativeCrash();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Plugin.SentryCapacitor.crash).toBeCalled();
    });
  });

  /* TODO: To be implemented
  describe('UserFeedback', () => {
    test('sends UserFeedback to native Layer', () => {
      const mockTransportSend: jest.Mock = jest.fn(() => Promise.resolve());
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
      });

      client.captureUserFeedback({
        comments: 'Test Comments',
        email: 'test@email.com',
        name: 'Test User',
        event_id: 'testEvent123',
      });

      expect(mockTransportSend.mock.calls[0][firstArg][envelopeHeader].event_id).toEqual('testEvent123');
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][0][envelopeItemHeader].type).toEqual(
        'user_report',
      );
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][0][envelopeItemPayload]).toEqual({
        comments: 'Test Comments',
        email: 'test@email.com',
        name: 'Test User',
        event_id: 'testEvent123',
      });
    });
  });
*/

  /*
  TODO: FIX SdkInfo
  describe('envelopeHeader SdkInfo', () => {
    let mockTransportSend: jest.Mock;
    let client: CapacitorClient;

    beforeEach(() => {
      mockTransportSend = jest.fn(() => Promise.resolve());
      client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
      });
    });

    afterEach(() => {
      mockTransportSend.mockClear();
    });

    const expectedSdkInfo = { name: SDK_NAME, version: SDK_VERSION };
    const getSdkInfoFrom = (func: jest.Mock) => func.mock.calls[0][firstArg][envelopeHeader].sdk;

    test('send SdkInfo in the message envelope header', () => {
      client.captureMessage('message_test_value');
      expect(getSdkInfoFrom(mockTransportSend)).toStrictEqual(expectedSdkInfo);
    });

    test('send SdkInfo in the exception envelope header', () => {
      client.captureException(new Error());
      expect(getSdkInfoFrom(mockTransportSend)).toStrictEqual(expectedSdkInfo);
    });

    test('send SdkInfo in the event envelope header', () => {
      client.captureEvent({});
      expect(getSdkInfoFrom(mockTransportSend)).toStrictEqual(expectedSdkInfo);
    });

    test('send SdkInfo in the session envelope header', () => {
      client.captureSession(getMockSession());
      expect(getSdkInfoFrom(mockTransportSend)).toStrictEqual(expectedSdkInfo);
    });

    test('send SdkInfo in the user feedback envelope header', () => {
      client.captureUserFeedback(getMockUserFeedback());
      expect(getSdkInfoFrom(mockTransportSend)).toStrictEqual(expectedSdkInfo);
    });
  });
*/
    /* TODO: Fix SDKInfo
  describe('event data enhancement', () => {
    test('event contains sdk default information', async () => {
      const mockedSend = jest.fn<PromiseLike<void>, [Envelope]>().mockResolvedValue(undefined);
      const mockedTransport = (): Transport => ({
        send: mockedSend,
        flush: jest.fn().mockResolvedValue(true),
      });
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: mockedTransport,
      });

      client.captureEvent({ message: 'test event' });

      expect(mockedSend).toBeCalled();
      const actualEvent: Event | undefined = <Event>(
        mockedSend.mock.calls[0][firstArg][envelopeItems][0][envelopeItemPayload]
      );
      expect(actualEvent?.sdk?.packages).toEqual([
        {
          name: SDK_PACKAGE_NAME,
          version: SDK_VERSION,
        },
      ]);
    });

  });
*/
  describe('normalizes events', () => {
    /* TODO: Fix later
    test('handles circular input', async () => {
      const mockedSend = jest.fn<PromiseLike<void>, [Envelope]>();
      const mockedTransport = (): Transport => ({
        send: mockedSend,
        flush: jest.fn().mockResolvedValue(true),
      });
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: mockedTransport,
      });
      const circularEvent = {
        extra: {
          circular: {},
        },
      };
      circularEvent.extra.circular = circularEvent;

      client.captureEvent(circularEvent);

      expect(mockedSend).toBeCalled();
      const actualEvent: Event | undefined = <Event>(
        mockedSend.mock.calls[0][firstArg][envelopeItems][0][envelopeItemPayload]
      );
      expect(actualEvent?.extra).toEqual({
        circular: {
          extra: '[Circular ~]',
        },
      });
    });
    */
  });

  /* TODO: To be fixed on Client Report implementation.
  describe('clientReports', () => {
    test('does not send client reports if disabled', () => {
      const mockTransportSend = jest.fn((_envelope: Envelope) => Promise.resolve());
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
        sendClientReports: false,
      });

      mockDroppedEvent(client);

      client.captureMessage('message_test_value');

      expectOnlyMessageEventInEnvelope(mockTransportSend);
    });

    /* TODO: Implement Client Report
    test('send client reports on event envelope', () => {
      const mockTransportSend = jest.fn((_envelope: Envelope) => Promise.resolve());
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
        sendClientReports: true,
      });

      mockDroppedEvent(client);

      client.captureMessage('message_test_value');

      expect(mockTransportSend).toBeCalledTimes(1);
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][1][envelopeItemHeader]).toEqual({
        type: 'client_report',
      });
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][1][envelopeItemPayload]).toEqual(
        expect.objectContaining({
          discarded_events: [
            {
              reason: 'before_send',
              category: 'error',
              quantity: 1,
            },
          ],
        }),
      );
      expect((client as unknown as { _outcomesBuffer: Outcome[] })._outcomesBuffer).toEqual(<Outcome[]>[]);
    });

    test('does not send empty client report', () => {
      const mockTransportSend = jest.fn((_envelope: Envelope) => Promise.resolve());
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
        sendClientReports: true,
      });

      client.captureMessage('message_test_value');

      expectOnlyMessageEventInEnvelope(mockTransportSend);
    });
*/
    /*
    TODO: To be implemented
    test('keeps outcomes in case envelope fails to send', () => {
      const mockTransportSend = jest.fn((_envelope: Envelope) => rejectedSyncPromise(new SentryError('Test')));
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
        sendClientReports: true,
      });

      mockDroppedEvent(client);

      client.captureMessage('message_test_value');

      expect((client as unknown as { _outcomesBuffer: Outcome[] })._outcomesBuffer).toEqual(<Outcome[]>[
        { reason: 'before_send', category: 'error', quantity: 1 },
      ]);
    });
    */

    /*
    TODO: To be implemented.
    test('sends buffered client reports on second try', () => {
      const mockTransportSend = getSyncPromiseRejectOnFirstCall<[Envelope]>(new SentryError('Test'));
      const client = new CapacitorClient({
        ...DEFAULT_OPTIONS,
        dsn: EXAMPLE_DSN,
        transport: () => ({
          send: mockTransportSend,
          flush: jest.fn(),
        }),
        sendClientReports: true,
      });

      mockDroppedEvent(client);
      client.captureMessage('message_test_value_1');
      mockDroppedEvent(client);
      client.captureMessage('message_test_value_2');

      expect(mockTransportSend).toBeCalledTimes(2);
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems].length).toEqual(2);
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][1][envelopeItemHeader]).toEqual({
        type: 'client_report',
      });
      expect(mockTransportSend.mock.calls[0][firstArg][envelopeItems][1][envelopeItemPayload]).toEqual(
        expect.objectContaining({
          discarded_events: [
            {
              reason: 'before_send',
              category: 'error',
              quantity: 2,
            },
          ],
        }),
      );
      expect((client as unknown as { _outcomesBuffer: Outcome[] })._outcomesBuffer).toEqual(<Outcome[]>[]);
    });
    */
  });


  function mockedOptions(options: Partial<CapacitorClientOptions>): CapacitorClientOptions {
    return {
      integrations: [],
      stackParser: jest.fn().mockReturnValue([]),
      transport: () => ({
        send: jest.fn(),
        flush: jest.fn(),
      }),
      ...options,
    };
  }
