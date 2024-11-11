import { getClient } from '@sentry/core';
import type { Client, Event } from '@sentry/types';
import { logger } from '@sentry/utils';

import { deviceContextIntegration } from '../../src/integrations';
import { NATIVE } from '../../src/wrapper';

jest.mock('../../src/wrapper', () => ({
  NATIVE: {
    fetchNativeDeviceContexts: jest.fn()
  }
}));


describe('Device Context Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('return original event if integration fails', async () => {
    logger.log = jest.fn();

    const originalEvent = { environment: 'original' } as Event;

    (
      NATIVE.fetchNativeDeviceContexts as jest.MockedFunction<typeof NATIVE.fetchNativeDeviceContexts>
    ).mockImplementation(() => Promise.reject(new Error('it failed :(')))

    const returnedEvent = await processEvent(originalEvent);
    expect(returnedEvent).toStrictEqual(originalEvent);
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('Failed to get device context from native: Error: it failed :(');
  });

  it('add native user', async () => {
      (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue(
        { user: { id: 'native-user' }
      });
    const event = await processEvent({});

    expect(event).toEqual({ user: { id: 'native-user' } });
  });

  it('do not overwrite event user', async () => {
    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ user: { id: 'native-user' } });
    const event = await processEvent({user: {id: 'js-user'}});

    expect(event).toEqual({ user: { id: 'js-user' } });
  });

  it('do not overwrite event app context', async () => {
    const expectedEvent: Event = { contexts: { app: { view_names: ['Home'] } } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ app: { view_names: ['native view'] } });
    const event = await processEvent({...expectedEvent});

    expect(event).toEqual(expectedEvent);
  });

  it('merge event context app', async () => {

    const eventReceived: Event = { contexts: { app: { event_app: 'value' } } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ contexts: { app: { native: 'value' } } });
    const processedEvent = await processEvent(eventReceived);
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
    const eventReceived: Event = { contexts: { keyContext: { key: 'value' } } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ contexts: { app: { native: 'value' } } });
    const processedEvent = await processEvent(eventReceived);

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
    const eventReceived: Event = { contexts: { duplicate: { context: 'event-value' }, native: { context: 'value' } } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({
      contexts: { duplicate: { context: 'native-value' }, event: { context: 'value' } }
    });
    const processedEvent = await processEvent(eventReceived);

    expect(processedEvent).toStrictEqual({
      contexts: {
        duplicate: { context: 'event-value' },
        native: { context: 'value' },
        event: { context: 'value' },
      },
    });
  });

  it('merge native tags', async () => {
    const eventReceived: Event = { tags: { duplicate: 'event-tag', event: 'tag' } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ tags: { duplicate: 'native-tag', native: 'tag' } });

    const processedEvent = await processEvent(eventReceived);

    expect(processedEvent).toStrictEqual({
      tags: {
        duplicate: 'event-tag',
        native: 'tag',
        event: 'tag',
      }
    });
  });

  it('merge native extra', async () => {
    const eventReceived: Event = { extra: { duplicate: 'event-extra', event: 'extra' } };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ extra: { duplicate: 'native-extra', native: 'extra' } });

    const processedEvent = await processEvent(eventReceived);

    expect(processedEvent).toStrictEqual({
      extra: {
        duplicate: 'event-extra',
        native: 'extra',
        event: 'extra',
      },
    });
  });

  it('merge fingerprints', async () => {
    const eventReceived: Event = { fingerprint: ['duplicate-fingerprint', 'event-fingerprint'] };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue({ fingerprint: ['duplicate-fingerprint', 'native-fingerprint'] });

    const processedEvent = await processEvent(eventReceived);

    expect(processedEvent).toStrictEqual({
      fingerprint: ['duplicate-fingerprint', 'event-fingerprint', 'native-fingerprint']
    });
  });

  it('add native level', async () => {
    const expectedEvent: Event = { level: 'fatal' };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue( { level: 'fatal' });

    const eventReceived = await processEvent({});

    expect(eventReceived).toStrictEqual(expectedEvent);
  });

  it('do not overwrite event level', async () => {
    const expectedEvent: Event = { level: 'fatal' };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue( { level: 'info' });

    const eventReceived = await processEvent({...expectedEvent});

    expect(eventReceived).toStrictEqual(expectedEvent);
  });

  it('add native environment', async () => {
    const expectedEvent: Event = { environment: 'native-environent' };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue( { environment: 'native-environent' });

    const eventReceived = await processEvent({});

    expect(eventReceived).toStrictEqual(expectedEvent);
  });

  it('do not overwrite event environment', async () => {
    const expectedEvent: Event = { environment: 'js-environent' };

    (NATIVE.fetchNativeDeviceContexts as jest.Mock).mockReturnValue( { environment: 'native-environent' });

    const eventReceived = await processEvent({...expectedEvent});

    expect(eventReceived).toStrictEqual(expectedEvent);
  });
});

async function processEvent(mockedEvent: Event): Promise<Event | null> {
  const finalClient = getClient();
  const integration = deviceContextIntegration();
  return integration.processEvent!(mockedEvent, {}, finalClient ?? {} as Client);}

// TODO: Breadcrumbs merge test.
