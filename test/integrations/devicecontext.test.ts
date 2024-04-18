import type { Hub } from '@sentry/core';
import type { Breadcrumb, Event, SeverityLevel } from '@sentry/types';

import type { NativeDeviceContextsResponse } from '../../src/definitions';

jest.mock('@sentry/utils', () => ({
  ...jest.requireActual('@sentry/utils'),
  logger: {
    log: jest.fn()
  }
}));
jest.mock('../../src/wrapper');

import { logger } from '@sentry/utils';

import { DeviceContext } from '../../src/integrations';
import { NATIVE } from '../../src/wrapper';

describe('Device Context Integration', () => {
  let integration: DeviceContext;

  const mockGetCurrentHub = () =>
    ({
      getIntegration: () => integration,
    } as unknown as Hub);

  beforeEach(() => {
    integration = new DeviceContext();
  });

  it('return original event if integration fails', async () => {
    const originalEvent = { environment: 'original' } as Event;

    (
      NATIVE.fetchNativeDeviceContexts as jest.MockedFunction<typeof NATIVE.fetchNativeDeviceContexts>
    ).mockImplementation(() => Promise.reject(new Error('it failed :(')))

    const returnedEvent = await executeIntegrationFor(originalEvent);
    expect(returnedEvent).toStrictEqual(originalEvent);
    expect(logger.log).toBeCalledTimes(1);
    expect(logger.log).toBeCalledWith('Failed to get device context from native: Error: it failed :(');
  });

  it('add native user', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { user: { id: 'native-user' } },
      })
    ).expectEvent.toStrictEqualToNativeContexts();
  });

  it('do not overwrite event user', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { user: { id: 'native-user' } },
        mockEvent: { user: { id: 'event-user' } },
      })
    ).expectEvent.toStrictEqualMockEvent();
  });

  it('do not overwrite event app context', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { app: { view_names: ['native view'] } },
        mockEvent: { contexts: { app: { view_names: ['Home'] } } },
      })
    ).expectEvent.toStrictEqualMockEvent();
  });

  it('merge event context app', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { app: { native: 'value' } } },
      mockEvent: { contexts: { app: { event_app: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        app: {
          event_app: 'value',
          native: 'value',
        },
      },
    });
  });

  it('merge event context app even when event app doesnt exist', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { app: { native: 'value' } } },
      mockEvent: { contexts: { keyContext: { key: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        keyContext: {
          key: 'value',
        },
        app: {
          native: 'value',
        },
      },
    });
  });

  it('merge event and native contexts', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { duplicate: { context: 'native-value' }, native: { context: 'value' } } },
      mockEvent: { contexts: { duplicate: { context: 'event-value' }, event: { context: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        duplicate: { context: 'event-value' },
        native: { context: 'value' },
        event: { context: 'value' },
      },
    });
  });

  it('merge native tags', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { tags: { duplicate: 'native-tag', native: 'tag' } },
      mockEvent: { tags: { duplicate: 'event-tag', event: 'tag' } },
    });
    expect(processedEvent).toStrictEqual({
      tags: {
        duplicate: 'event-tag',
        native: 'tag',
        event: 'tag',
      }
    });
  });

  it('merge native extra', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { extra: { duplicate: 'native-extra', native: 'extra' } },
      mockEvent: { extra: { duplicate: 'event-extra', event: 'extra' } },
    });
    expect(processedEvent).toStrictEqual({
      extra: {
        duplicate: 'event-extra',
        native: 'extra',
        event: 'extra',
      },
    });
  });

  it('merge fingerprints', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { fingerprint: ['duplicate-fingerprint', 'native-fingerprint'] },
      mockEvent: { fingerprint: ['duplicate-fingerprint', 'event-fingerprint'] },
    });
    expect(processedEvent).toStrictEqual({
      fingerprint: ['duplicate-fingerprint', 'event-fingerprint', 'native-fingerprint']
    });
  });

  it('add native level', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { level: <SeverityLevel>'fatal' },
      })
    ).expectEvent.toStrictEqualToNativeContexts();
  });

  it('do not overwrite event level', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { level: 'native-level' },
        mockEvent: { level: 'info' },
      })
    ).expectEvent.toStrictEqualMockEvent();
  });

  it('add native environment', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { environment: 'native-environment' },
      })
    ).expectEvent.toStrictEqualToNativeContexts();
  });

  it('do not overwrite event environment', async () => {
    (
      await executeIntegrationWith({
        nativeContexts: { environment: 'native-environment' },
        mockEvent: { environment: 'event-environment' },
      })
    ).expectEvent.toStrictEqualMockEvent();
  });

  it('use only native breadcrumbs', async () => {
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { breadcrumbs: [{ message: 'duplicate-breadcrumb' }, { message: 'native-breadcrumb' }] },
      mockEvent: { breadcrumbs: [{ message: 'duplicate-breadcrumb' }, { message: 'event-breadcrumb' }] },
    });
    expect(processedEvent).toStrictEqual({
      breadcrumbs: [{ message: 'duplicate-breadcrumb' }, { message: 'native-breadcrumb' }]
    });
  });
/*
  it('adds in_foreground false to native app contexts', async () => {
    mockCurrentAppState = 'background';
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { app: { native: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        app: {
          native: 'value',
          in_foreground: false,
        },
      },
    });
  });

  it('adds in_foreground to native app contexts', async () => {
    mockCurrentAppState = 'active';
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { app: { native: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        app: {
          native: 'value',
          in_foreground: true,
        },
      },
    });
  });

  it('do not add in_foreground if unknown', async () => {
    mockCurrentAppState = 'unknown';
    const { processedEvent } = await executeIntegrationWith({
      nativeContexts: { contexts: { app: { native: 'value' } } },
    });
    expect(processedEvent).toStrictEqual({
      contexts: {
        app: {
          native: 'value',
        },
      },
    });
  });
*/
  async function executeIntegrationWith({
    nativeContexts,
    mockEvent,
  }: {
    nativeContexts: Record<string, unknown>;
    mockEvent?: Event;
  }): Promise<{
    processedEvent: Event | null;
    expectEvent: {
      toStrictEqualToNativeContexts: () => void;
      toStrictEqualMockEvent: () => void;
    };
  }> {
    (
      NATIVE.fetchNativeDeviceContexts as jest.MockedFunction<typeof NATIVE.fetchNativeDeviceContexts>
    ).mockImplementation(() => Promise.resolve(nativeContexts as NativeDeviceContextsResponse));
    const originalNativeContexts = { ...nativeContexts };
    const originalMockEvent = { ...mockEvent };
    const processedEvent =await executeIntegrationFor(mockEvent ?? {});
    return {
      processedEvent,
      expectEvent: {
        toStrictEqualToNativeContexts: () => expect(processedEvent).toStrictEqual(originalNativeContexts),
        toStrictEqualMockEvent: () => expect(processedEvent).toStrictEqual(originalMockEvent),
      },
    };
  }

  function executeIntegrationFor(mockedEvent: Event): Promise<Event | null> {
    return new Promise((resolve, reject) => {
      integration.setupOnce(async eventProcessor => {
        try {
          const processedEvent = await eventProcessor(mockedEvent, {});
          resolve(processedEvent);
        } catch (e) {
          reject(e);
        }
      }, mockGetCurrentHub);
    });
  }
});

describe('Device Context Breadcrumb filter', () =>
{
  const integration = new DeviceContext();
  const mergeUniqueBreadcrumbs = integration['_mergeUniqueBreadcrumbs'];

  it('merge breadcrumbs if same timestamp and message', async () => {
    const jsList = [{ timestamp: 1, message: 'duplicated breadcrumb' }] as Breadcrumb[];
    const nativeList = [{ timestamp: 1, message: 'duplicated breadcrumb' }] as Breadcrumb[];
    expect(mergeUniqueBreadcrumbs(jsList, nativeList)).toStrictEqual(
      [{ timestamp: 1, message: 'duplicated breadcrumb' }] as Breadcrumb[]);
  });

  it('merge breadcrumbs on different index', async () => {
    const jsList = [{ timestamp: 2, message: 'duplicated breadcrumb' }] as Breadcrumb[];
    const nativeList = [
      { timestamp: 1, message: 'new natieve'},
      { timestamp: 2, message: 'duplicated breadcrumb' }] as Breadcrumb[];
    expect(mergeUniqueBreadcrumbs(jsList, nativeList)).toStrictEqual([
      { timestamp: 1, message: 'new natieve'},
      { timestamp: 2, message: 'duplicated breadcrumb' }] as Breadcrumb[]);
  });

  it('joins different breadcrumbs', async () => {
    const jsList = [
    { timestamp: 1, message: 'new js'},
    { timestamp: 2, message: 'new js' }] as Breadcrumb[];
  const nativeList = [
      { timestamp: 1, message: 'new native'},
      { timestamp: 2, message: 'new native' }] as Breadcrumb[];
    expect(mergeUniqueBreadcrumbs(jsList, nativeList)).toStrictEqual([
      { timestamp: 1, message: 'new native'},
      { timestamp: 1, message: 'new js'},
      { timestamp: 2, message: 'new native'},
      { timestamp: 2, message: 'new js'}] as Breadcrumb[]);
  });

  it('all javascript breadcrumbs merged when list is larger than native one', async () => {
    const jsList = [
    { timestamp: 1, message: 'new js'},
    { timestamp: 2, message: 'new js'},
    { timestamp: 3, message: 'new js'},
    { timestamp: 4, message: 'new js' }] as Breadcrumb[];
  const nativeList = [
      { timestamp: 1, message: 'new native'},
      { timestamp: 2, message: 'new native' }] as Breadcrumb[];
    expect(mergeUniqueBreadcrumbs(jsList, nativeList)).toStrictEqual([
      { timestamp: 1, message: 'new native'},
      { timestamp: 1, message: 'new js'},
      { timestamp: 2, message: 'new native'},
      { timestamp: 2, message: 'new js'},
      { timestamp: 3, message: 'new js'},
      { timestamp: 4, message: 'new js' }] as Breadcrumb[]);
  });

  it('all native breadcrumbs merged when list is larger than javascripty one', async () => {
  const jsList = [
      { timestamp: 1, message: 'new js'},
      { timestamp: 2, message: 'new js' }] as Breadcrumb[];
      const nativeList = [
        { timestamp: 1, message: 'new native'},
        { timestamp: 2, message: 'new native'},
        { timestamp: 3, message: 'new native'},
        { timestamp: 4, message: 'new native' }] as Breadcrumb[];
        expect(mergeUniqueBreadcrumbs(jsList, nativeList)).toStrictEqual([
      { timestamp: 1, message: 'new native'},
      { timestamp: 1, message: 'new js'},
      { timestamp: 2, message: 'new native'},
      { timestamp: 2, message: 'new js'},
      { timestamp: 3, message: 'new native'},
      { timestamp: 4, message: 'new native' }] as Breadcrumb[]);
  });

  it('Handles empty input arrays', () => {
    // Mock empty input arrays
    const jsList: Breadcrumb[] = [];
    const nativeList: Breadcrumb[] = [];

    // Call the private method
    const result = mergeUniqueBreadcrumbs(jsList, nativeList);

    // Assert that the result is an empty array
    expect(result).toEqual([]);
  });

});
