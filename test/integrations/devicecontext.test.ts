import type { Client, Event, EventHint } from '@sentry/core';
import { deviceContextIntegration } from '../../src/integrations/devicecontext';
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

describe('DeviceContext Integration', () => {
  let mockClient: Client;
  let mockGetOptions: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOptions = jest.fn(() => ({ maxBreadcrumbs: 100 }));
    mockClient = {
      getOptions: mockGetOptions,
    } as unknown as Client;
    NATIVE.fetchNativeDeviceContexts.mockResolvedValue({});
  });

  describe('integration setup', () => {
    it('should return integration with correct name', () => {
      const integration = deviceContextIntegration();
      expect(integration.name).toBe('DeviceContext');
      expect(integration.processEvent).toBeDefined();
    });
  });

  describe('context merging', () => {
    it('should merge native contexts into event', async () => {
      const nativeContexts = {
        contexts: {
          device: {
            name: 'iPhone',
            model: 'iPhone 13',
          },
          os: {
            name: 'iOS',
            version: '15.0',
          },
        },
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};
      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.contexts).toEqual({
        device: {
          name: 'iPhone',
          model: 'iPhone 13',
        },
        os: {
          name: 'iOS',
          version: '15.0',
        },
      });
    });

    it('should merge event contexts with native contexts, event taking precedence', async () => {
      const nativeContexts = {
        contexts: {
          device: {
            name: 'iPhone',
            model: 'iPhone 13',
          },
        },
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        contexts: {
          device: {
            name: 'Android Device',
            model: 'Pixel 5',
          },
          app: {
            name: 'MyApp',
          },
        },
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.contexts).toEqual({
        device: {
          name: 'Android Device',
          model: 'Pixel 5',
        },
        app: {
          name: 'MyApp',
        },
      });
    });

    it('should handle empty native contexts', async () => {
      NATIVE.fetchNativeDeviceContexts.mockResolvedValue({ contexts: {} });

      const event: Event = {
        contexts: {
          app: {
            name: 'MyApp',
          },
        },
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.contexts).toEqual({
        app: {
          name: 'MyApp',
        },
      });
    });
  });

  describe('user merging', () => {
    it('should merge native user into event when event has no user', async () => {
      const nativeContexts = {
        contexts: {
          user: {
            id: 'native-user-id',
            email: 'native@example.com',
            username: 'native-user',
          },
        },
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};
      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.user).toEqual({
        id: 'native-user-id',
        email: 'native@example.com',
        username: 'native-user',
      });
    });

    it('should not override event user when event already has user', async () => {
      const nativeContexts = {
        contexts: {
          user: {
            id: 'native-user-id',
            email: 'native@example.com',
          },
        },
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        user: {
          id: 'event-user-id',
          email: 'event@example.com',
        },
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.user).toEqual({
        id: 'event-user-id',
        email: 'event@example.com',
      });
    });

    it('should handle user in contexts but not merge if not in contexts object', async () => {
      const nativeContexts = {
        contexts: {
          device: {
            name: 'iPhone',
          },
        },
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};
      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.user).toBeUndefined();
    });
  });

  describe('breadcrumb processing', () => {
    it('should process and merge native breadcrumbs with event breadcrumbs', async () => {
      const nativeBreadcrumbs = [
        {
          type: 'navigation',
          level: 'info',
          message: 'Native breadcrumb 1',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
        {
          type: 'user',
          level: 'info',
          message: 'Native breadcrumb 2',
          timestamp: '2023-01-01T00:00:01.000Z',
        },
      ];

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb',
            timestamp: 1672531201.5, // 2023-01-01T00:00:01.500Z
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(3);
      expect(result?.breadcrumbs?.[0]?.message).toBe('Native breadcrumb 1');
      expect(result?.breadcrumbs?.[1]?.message).toBe('Native breadcrumb 2');
      expect(result?.breadcrumbs?.[2]?.message).toBe('JS breadcrumb');
    });

    it('should sort breadcrumbs by timestamp', async () => {
      const nativeBreadcrumbs = [
        {
          type: 'navigation',
          level: 'info',
          message: 'Native breadcrumb later',
          timestamp: '2023-01-01T00:00:02.000Z',
        },
      ];

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb earlier',
            timestamp: 1672531200.5, // 2023-01-01T00:00:00.500Z
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(2);
      expect(result?.breadcrumbs?.[0]?.message).toBe('JS breadcrumb earlier');
      expect(result?.breadcrumbs?.[1]?.message).toBe('Native breadcrumb later');
    });

    it('should limit breadcrumbs to maxBreadcrumbs from client options', async () => {
      mockGetOptions.mockReturnValue({ maxBreadcrumbs: 3 });

      const nativeBreadcrumbs = Array.from({ length: 5 }, (_, i) => ({
        type: 'navigation',
        level: 'info',
        message: `Native breadcrumb ${i}`,
        timestamp: `2023-01-01T00:00:0${i}.000Z`,
      }));

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb',
            timestamp: 1672531200.0,
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(3);
      // Should keep the last 3 breadcrumbs after sorting
      expect(result?.breadcrumbs?.[result?.breadcrumbs?.length - 1]?.message).toBe('Native breadcrumb 4');
    });

    it('should use default maxBreadcrumbs of 100 when not specified', async () => {
      mockGetOptions.mockReturnValue({});

      const nativeBreadcrumbs = Array.from({ length: 50 }, (_, i) => ({
        type: 'navigation',
        level: 'info',
        message: `Native breadcrumb ${i}`,
        timestamp: `2023-01-01T00:00:${String(i).padStart(2, '0')}.000Z`,
      }));

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(50);
    });

    it('should handle breadcrumbs when event has no breadcrumbs', async () => {
      const nativeBreadcrumbs = [
        {
          type: 'navigation',
          level: 'info',
          message: 'Native breadcrumb',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      ];

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(1);
      expect(result?.breadcrumbs?.[0]?.message).toBe('Native breadcrumb');
    });

    it('should handle when native breadcrumbs is not an array', async () => {
      const nativeContexts = {
        contexts: {},
        breadcrumbs: 'not an array',
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb',
            timestamp: 1672531200.0,
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(1);
      expect(result?.breadcrumbs?.[0]?.message).toBe('JS breadcrumb');
    });

    it('should handle when native breadcrumbs is undefined', async () => {
      const nativeContexts = {
        contexts: {},
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb',
            timestamp: 1672531200.0,
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(1);
      expect(result?.breadcrumbs?.[0]?.message).toBe('JS breadcrumb');
    });

    it('should handle breadcrumbs without timestamps', async () => {
      const nativeBreadcrumbs = [
        {
          type: 'navigation',
          level: 'info',
          message: 'Native breadcrumb no timestamp',
        },
        {
          type: 'user',
          level: 'info',
          message: 'Native breadcrumb with timestamp',
          timestamp: '2023-01-01T00:00:01.000Z',
        },
      ];

      const nativeContexts = {
        contexts: {},
        breadcrumbs: nativeBreadcrumbs,
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {};

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.breadcrumbs).toHaveLength(2);
      // Breadcrumb without timestamp should be treated as 0
      expect(result?.breadcrumbs?.[0]?.message).toBe('Native breadcrumb no timestamp');
    });
  });

  describe('error handling', () => {
    it('should handle errors from fetchNativeDeviceContexts gracefully', async () => {
      const error = new Error('Native fetch failed');
      NATIVE.fetchNativeDeviceContexts.mockRejectedValue(error);

      const event: Event = {
        contexts: {
          app: {
            name: 'MyApp',
          },
        },
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      // Event should be returned unchanged
      expect(result?.contexts).toEqual({
        app: {
          name: 'MyApp',
        },
      });
    });

    it('should return event even when native fetch throws', async () => {
      NATIVE.fetchNativeDeviceContexts.mockRejectedValue(new Error('Network error'));

      const event: Event = {
        message: 'Test event',
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.message).toBe('Test event');
    });
  });

  describe('combined scenarios', () => {
    it('should handle contexts, user, and breadcrumbs together', async () => {
      const nativeContexts = {
        contexts: {
          device: {
            name: 'iPhone',
          },
          user: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
        breadcrumbs: [
          {
            type: 'navigation',
            level: 'info',
            message: 'Native breadcrumb',
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ],
      };

      NATIVE.fetchNativeDeviceContexts.mockResolvedValue(nativeContexts);

      const event: Event = {
        contexts: {
          app: {
            name: 'MyApp',
          },
        },
        breadcrumbs: [
          {
            type: 'log',
            level: 'info',
            message: 'JS breadcrumb',
            timestamp: 1672531201.0,
          },
        ],
      };

      const integration = deviceContextIntegration();
      const result = await integration.processEvent!(event, {} as EventHint, mockClient);

      expect(result?.contexts).toEqual({
        device: {
          name: 'iPhone',
        },
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        app: {
          name: 'MyApp',
        },
      });

      if (result === null) {
        throw new Error('Result is undefined');
      }

      expect(result.user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
      });
      expect(result.breadcrumbs).toHaveLength(2);
      expect(result.breadcrumbs![0]?.message).toBe('Native breadcrumb');
      expect(result.breadcrumbs![1]?.message).toBe('JS breadcrumb');
    });
  });
});

