jest.mock('../src/wrapper', () => jest.requireActual('./mockWrapper'));

import type { BrowserOptions } from '@sentry/browser';
import { getClient, setCurrentClient } from '@sentry/core';
import { sdkInit } from '../src/client';
import type { CapacitorOptions } from '../src/options';
import { SDK_NAME, SDK_VERSION } from '../src/version';
import { getDefaultTestClientOptions, TestClient } from './mocks/client';
import { NATIVE } from './mockWrapper';

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
        'Native Sentry SDK failed to initialize. Using Sentry JavaScript SDK without native integraiton.\n',
        { error: initError }
      );

      // Should restore non-native options (transport should be set to custom transport)
      expect(browserOptions.transport).toBe(mockCustomTransport);

      consoleSpy.mockRestore();
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
