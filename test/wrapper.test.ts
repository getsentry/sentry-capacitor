import { Severity } from '@sentry/types';
import { logger } from '@sentry/utils';

import { NATIVE } from '../src/wrapper';

jest.mock(
  '@capacitor/core',
  () => ({
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
        getStringBytesLength: jest.fn(() => Promise.resolve(1)),
        nativeClientAvailable: jest.fn(() => Promise.resolve(true)),
        nativeTransportAvailable: jest.fn(() => Promise.resolve(true)),
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
  });
});
