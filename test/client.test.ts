jest.mock('../src/wrapper', () => jest.requireActual('./mockWrapper'));

jest.mock('../src/NativeLogListener', () => ({
  setupNativeLogListener: jest.fn(),
  defaultNativeLogHandler: jest.fn(),
}));

import type { BrowserOptions } from '@sentry/browser';
import { getClient, setCurrentClient } from '@sentry/core';
import { sdkInit } from '../src/client';
import { defaultNativeLogHandler, setupNativeLogListener } from '../src/NativeLogListener';
import type { CapacitorOptions } from '../src/options';
import { SDK_NAME, SDK_VERSION } from '../src/version';
import { getDefaultTestClientOptions, TestClient } from './mocks/client';
import { NATIVE } from './mockWrapper';

const mockSetupNativeLogListener = setupNativeLogListener as jest.Mock;
const mockDefaultNativeLogHandler = defaultNativeLogHandler as jest.Mock;

describe('client', () => {
  let mockOriginalInit: jest.Mock;
  let mockCustomTransport: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOriginalInit = jest.fn();
    mockCustomTransport = jest.fn();

    // Reset NATIVE mock
    NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

    // Set up a test client
    const testClient = new TestClient(getDefaultTestClientOptions());
    setCurrentClient(testClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sdkInit', () => {
    it('should initialize native SDK first, then browser SDK on success', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      // Mock successful native init
      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(NATIVE.initNativeSdk).toHaveBeenCalledWith(nativeOptions);
      expect(mockOriginalInit).toHaveBeenCalledWith(browserOptions);
    });

    it('should fallback to JS-only SDK when native init fails', async () => {
      const originalTransport = jest.fn();
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
        transport: originalTransport,
        enableNative: true,
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      // Mock failed native init
      const initError = new Error('Native init failed');
      NATIVE.initNativeSdk = jest.fn().mockRejectedValue(initError);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(NATIVE.initNativeSdk).toHaveBeenCalledWith(nativeOptions);
      expect(mockOriginalInit).toHaveBeenCalledWith(browserOptions);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Native Sentry SDK failed to initialize. Using Sentry JavaScript SDK without native integration.\n',
        { error: initError }
      );

      // Events are routed to the fetch fallback by the native transport.
      await expect(NATIVE.nativeReady).resolves.toBe(false);

      consoleSpy.mockRestore();
    });

    it('creates the JS client synchronously, before native init resolves', () => {
      let resolveNative: (v: boolean) => void = () => undefined;
      NATIVE.initNativeSdk = jest.fn().mockReturnValue(new Promise<boolean>(r => (resolveNative = r)));

      sdkInit({ dsn: 'test-dsn' }, { dsn: 'test-dsn', enableNative: true }, mockOriginalInit);

      expect(NATIVE.initNativeSdk).toHaveBeenCalledTimes(1);
      expect(mockOriginalInit).toHaveBeenCalledTimes(1);
      resolveNative(true);
    });

    it('calls onReady with didCallNativeInit when native init finishes', async () => {
      const onReady = jest.fn();
      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(true);

      sdkInit({}, { dsn: 'test-dsn', enableNative: true, onReady }, mockOriginalInit);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(onReady).toHaveBeenCalledWith({ didCallNativeInit: true });
    });

    it('calls onReady with didCallNativeInit false when native init fails', async () => {
      const onReady = jest.fn();
      NATIVE.initNativeSdk = jest.fn().mockRejectedValue(new Error('fail'));
      jest.spyOn(console, 'error').mockImplementation();

      sdkInit({}, { dsn: 'test-dsn', enableNative: true, onReady }, mockOriginalInit);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(onReady).toHaveBeenCalledWith({ didCallNativeInit: false });
    });

    it('does not break when onReady throws', async () => {
      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(true);

      sdkInit({}, { dsn: 'test-dsn', onReady: () => { throw new Error('boom'); } }, mockOriginalInit);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockOriginalInit).toHaveBeenCalled();
    });

    it('should update client SDK metadata after initialization', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      // Set up client with initial SDK metadata
      const testClient = new TestClient({
        ...getDefaultTestClientOptions(),
        _metadata: {
          sdk: {
            name: 'sentry.javascript.browser',
            version: '7.0.0',
            packages: [
              {
                name: 'npm:@sentry/browser',
                version: '7.0.0',
              },
            ],
          },
        },
      });
      setCurrentClient(testClient);

      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      const client = getClient();
      const options = client?.getOptions();
      const sdk = options?._metadata?.sdk;

      expect(sdk?.name).toBe('sentry.javascript.browser.capacitor');
      expect(sdk?.version).toBe(SDK_VERSION);
      expect(sdk?.packages).toContainEqual({
        name: SDK_NAME,
        version: SDK_VERSION,
      });
    });

    it('should handle client without SDK metadata gracefully', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      // Set up client without SDK metadata
      const testClient = new TestClient(getDefaultTestClientOptions());
      setCurrentClient(testClient);

      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not throw and should still call the original init
      expect(mockOriginalInit).toHaveBeenCalledWith(browserOptions);
    });

    it('should handle missing client gracefully', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      // Clear the current client
      setCurrentClient(null as any);

      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not throw and should still call the original init
      expect(mockOriginalInit).toHaveBeenCalledWith(browserOptions);
    });

    it('should work without custom transport', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      expect(() => {
        sdkInit(browserOptions, nativeOptions, mockOriginalInit);
      }).not.toThrow();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockOriginalInit).toHaveBeenCalledWith(browserOptions);
    });

    describe('native log listener', () => {
      it('sets up the listener when debug is true', async () => {
        NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);
        const nativeOptions: CapacitorOptions = { dsn: 'test-dsn', debug: true };

        sdkInit({}, nativeOptions, mockOriginalInit, mockCustomTransport);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSetupNativeLogListener).toHaveBeenCalledWith(mockDefaultNativeLogHandler);
      });

      it('uses onNativeLog callback when provided', async () => {
        NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);
        const customHandler = jest.fn();
        const nativeOptions: CapacitorOptions = { dsn: 'test-dsn', debug: true, onNativeLog: customHandler };

        sdkInit({}, nativeOptions, mockOriginalInit, mockCustomTransport);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSetupNativeLogListener).toHaveBeenCalledWith(customHandler);
      });

      it('does not set up the listener when debug is false', async () => {
        NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);
        const nativeOptions: CapacitorOptions = { dsn: 'test-dsn', debug: false };

        sdkInit({}, nativeOptions, mockOriginalInit, mockCustomTransport);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSetupNativeLogListener).not.toHaveBeenCalled();
      });

      it('does not set up the listener when debug is not set', async () => {
        NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);
        const nativeOptions: CapacitorOptions = { dsn: 'test-dsn' };

        sdkInit({}, nativeOptions, mockOriginalInit, mockCustomTransport);
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockSetupNativeLogListener).not.toHaveBeenCalled();
      });

      it('sets up the listener before native init starts', () => {
        const order: string[] = [];
        mockSetupNativeLogListener.mockImplementation(() => order.push('listener'));
        NATIVE.initNativeSdk = jest.fn().mockImplementation(() => {
          order.push('init');
          return Promise.resolve(true);
        });

        sdkInit({}, { dsn: 'test-dsn', debug: true }, mockOriginalInit, mockCustomTransport);

        expect(order).toEqual(['listener', 'init']);
      });
    });

    it('should preserve existing SDK packages when updating metadata', async () => {
      const browserOptions: BrowserOptions = {
        dsn: 'test-dsn',
      };
      const nativeOptions: CapacitorOptions = {
        dsn: 'test-dsn',
        enableNative: true,
      };

      const existingPackage = {
        name: 'npm:@sentry/integrations',
        version: '7.0.0',
      };

      // Set up client with existing packages
      const testClient = new TestClient({
        ...getDefaultTestClientOptions(),
        _metadata: {
          sdk: {
            name: 'sentry.javascript.browser',
            version: '7.0.0',
            packages: [existingPackage],
          },
        },
      });
      setCurrentClient(testClient);

      NATIVE.initNativeSdk = jest.fn().mockResolvedValue(undefined);

      sdkInit(browserOptions, nativeOptions, mockOriginalInit, mockCustomTransport);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      const client = getClient();
      const options = client?.getOptions();
      const sdk = options?._metadata?.sdk;

      expect(sdk?.packages).toContainEqual(existingPackage);
      expect(sdk?.packages).toContainEqual({
        name: SDK_NAME,
        version: SDK_VERSION,
      });
    });
  });
});
