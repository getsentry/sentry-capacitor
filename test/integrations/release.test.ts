import type { Client, Event, EventHint } from '@sentry/core';
import { getClient } from '@sentry/core';
import { nativeReleaseIntegration } from '../../src/integrations/release';

jest.mock('@sentry/core', () => ({
  getClient: jest.fn().mockReturnValue({
    getOptions: jest.fn(() => ({})),
  }),
  addEventProcessor: jest.fn(),
}));

jest.mock('../../src/wrapper', () => ({
  NATIVE: {
    fetchNativeRelease: async () => ({
      build: 'native_build',
      id: 'native_id',
      version: 'native_version',
    }),
  },
}));

describe('Tests the Release integration', () => {
  test('Uses release from native SDK if release/dist are not present in options.', async () => {
    const mockEvent: Event = {};

    const event = await processEvent(mockEvent);
    expect(event?.release).toBe('native_id@native_version+native_build');
    expect(event?.dist).toBe('native_build');
  });

  test('Uses release from native SDK if release is not present in options.', async () => {
    const client = getClient();
    const mockEvent: Event = {};

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      dist: 'options_dist',
    }));

    const event = await processEvent(mockEvent, {}, client);

    expect(event?.release).toBe('native_id@native_version+native_build');
    expect(event?.dist).toBe('options_dist');
  });

  test('Uses dist from native SDK if dist is not present in options.', async () => {
    const client = getClient();
    const mockEvent: Event = {};

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      release: 'options_release',
    }));

    const event = await processEvent(mockEvent, {}, client);

    expect(event?.release).toBe('options_release');
    expect(event?.dist).toBe('native_build');
  });

  test('Uses release and dist from options', async () => {
    const client = getClient();
    const mockEvent: Event = {};


    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      dist: 'options_dist',
      release: 'options_release',
    }));

    const event = await processEvent(mockEvent, {}, client);

    expect(event?.release).toBe('options_release');
    expect(event?.dist).toBe('options_dist');
  });
});

function processEvent(mockedEvent: Event, mockedHint?: EventHint, client?: Client): Event | null | PromiseLike<Event | null> {
  const finalClient = client ?? getClient();
  const integration = nativeReleaseIntegration();
  return integration.processEvent!(mockedEvent, mockedHint ?? {}, finalClient ?? {} as Client);
}
