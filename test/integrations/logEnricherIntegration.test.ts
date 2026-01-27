import type { Client, Log, LogSeverityLevel } from '@sentry/core';
import { logEnricherIntegration } from '../../src/integrations/logEnricherIntegration';
import { NATIVE } from '../mockWrapper';

jest.mock('../../src/wrapper', () => ({
  NATIVE: require('../mockWrapper').NATIVE,
}));

jest.mock('@sentry/core', () => {
  const actual = jest.requireActual('@sentry/core');
  return {
    ...actual,
    debug: {
      log: jest.fn(),
    },
  };
});

function CreateLog(
  level?: LogSeverityLevel,
  message?: string,
  attributes?: Record<string, unknown>,
): Log {
  return {
    level: level ?? 'info',
    message: message ?? 'Test log message',
    attributes: attributes ?? {},
  };
}

describe('LogEnricher Integration', () => {
  let mockClient: Client;
  let mockOn: jest.Mock;
  let mockGetIntegrationByName: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOn = jest.fn();
    mockGetIntegrationByName = jest.fn();
    mockClient = {
      on: mockOn,
      getIntegrationByName: mockGetIntegrationByName,
    } as unknown as Client;
    NATIVE.fetchNativeLogAttributes.mockResolvedValue({});
  });

  describe('integration setup', () => {
    it('should return integration with correct name', () => {
      const integration = logEnricherIntegration();
      expect(integration.name).toBe('LogEnricher');
      expect(integration.setup).toBeDefined();
    });

    it('should register beforeCaptureLog handler on setup', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
            model: 'iPhone 13',
            family: 'iPhone',
          },
          os: {
            name: 'iOS',
            version: '15.0',
          },
        },
        release: '1.0.0',
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(NATIVE.fetchNativeLogAttributes).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        'beforeCaptureLog',
        expect.any(Function),
      );
    });

    it('should handle errors during cacheLogContext', async () => {
      const debugLog = require('@sentry/core').debug.log;
      const error = new Error('Failed to fetch attributes');
      NATIVE.fetchNativeLogAttributes.mockRejectedValue(error);

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(debugLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '[LOGS]: Failed to prepare attributes from Native Layer',
        ),
      );
      expect(mockOn).not.toHaveBeenCalled();
    });
  });

  describe('log attribute enrichment', () => {
    it('should enrich log with device context attributes', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
            model: 'iPhone 13',
            family: 'iPhone',
          },
          os: {
            name: 'iOS',
            version: '15.0',
          },
        },
        release: '1.0.0',
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(log.attributes).toEqual({
        'device.brand': 'Apple',
        'device.model': 'iPhone 13',
        'device.family': 'iPhone',
        'os.name': 'iOS',
        'os.version': '15.0',
        'sentry.release': '1.0.0',
      });
    });

    it('should override existing log attributes with native values', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
            model: 'iPhone 13',
          },
        },
        release: '1.0.0',
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog(undefined, undefined, {
        'device.brand': 'Samsung',
        'custom.attribute': 'custom-value',
      });

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(log.attributes).toEqual({
        'device.brand': 'Apple', // Native value overrides existing
        'custom.attribute': 'custom-value', // Custom attributes preserved
        'device.model': 'iPhone 13', // New value added
        'sentry.release': '1.0.0',
      });
    });

    it('should handle partial device context', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
          },
        },
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(log.attributes).toEqual({
        'device.brand': 'Apple',
      });
    });

    it('should handle empty native response', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({});

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(log.attributes).toEqual({});
    });

    it('should not process log if cache is undefined', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({});

      // Don't call setup, so cache remains undefined

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      // Since setup wasn't called, handler shouldn't be registered
      expect(mockOn).not.toHaveBeenCalled();
    });

    it('should add replay_id when Replay integration is available', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
          },
        },
      });

      const mockReplayIntegration = {
        getReplayId: jest.fn(() => 'replay-id-123'),
      };
      mockGetIntegrationByName.mockReturnValue(mockReplayIntegration);

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(mockGetIntegrationByName).toHaveBeenCalledWith('Replay');
      expect(log.attributes).toEqual({
        'device.brand': 'Apple',
        'sentry.replay_id': 'replay-id-123',
      });
    });

    it('should not add replay_id when Replay integration is not available', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
          },
        },
      });

      mockGetIntegrationByName.mockReturnValue(null);

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(mockGetIntegrationByName).toHaveBeenCalledWith('Replay');
      expect(log.attributes).not.toHaveProperty('sentry.replay_id');
    });

    it('should handle log without attributes', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: 'Apple',
          },
        },
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      expect(log.attributes).toEqual({
        'device.brand': 'Apple',
      });
    });

    it('should handle falsy values in native response', async () => {
      NATIVE.fetchNativeLogAttributes.mockResolvedValue({
        contexts: {
          device: {
            brand: '',
            model: null,
            family: undefined,
          },
          os: {
            name: 'iOS',
            version: '',
          },
        },
        release: null,
      });

      const integration = logEnricherIntegration();
      integration.setup!(mockClient);

      // Wait for cacheLogContext to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const log = CreateLog();

      const beforeCaptureLogHandler = mockOn.mock.calls.find(
        call => call[0] === 'beforeCaptureLog',
      )?.[1];

      if (beforeCaptureLogHandler) {
        beforeCaptureLogHandler(log, mockClient);
      }

      // Falsy values should not be set
      expect(log.attributes).toEqual({
        'os.name': 'iOS',
      });
    });
  });
});
