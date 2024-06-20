import { addEventProcessor, getClient } from '@sentry/core';
import type { EventProcessor } from '@sentry/types';

import { Release } from '../../src/integrations/release';

const mockRelease = Release;

jest.mock('@sentry/core', () => {
  const client = {
    getOptions: jest.fn(),
  };

  const hub = {
    getClient: () => client,
    // out-of-scope variables have to be prefixed with `mock` caseSensitive
    getIntegration: () => mockRelease,
  };

  return {
    addEventProcessor: jest.fn(),
    getCurrentHub: () => hub,
  };
});

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
    const releaseIntegration = new Release();

    let eventProcessor: EventProcessor = () => null;

    // @ts-expect-error Mock
    addEventProcessor.mockImplementation(e => (eventProcessor = e));
    releaseIntegration.setupOnce();

    expect(addEventProcessor).toBeCalled();

    const client = getClient();

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({}));

    const event = await eventProcessor({}, {});

    expect(event?.release).toBe('native_id@native_version+native_build');
    expect(event?.dist).toBe('native_build');
  });

  test('Uses release from native SDK if release is not present in options.', async () => {
    const releaseIntegration = new Release();

    let eventProcessor: EventProcessor = () => null;

    // @ts-expect-error Mock
    addEventProcessor.mockImplementation(e => (eventProcessor = e));
    releaseIntegration.setupOnce();

    const client = getClient();

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      dist: 'options_dist',
    }));

    const event = await eventProcessor({}, {});

    expect(event?.release).toBe('native_id@native_version+native_build');
    expect(event?.dist).toBe('options_dist');
  });

  test('Uses dist from native SDK if dist is not present in options.', async () => {
    const releaseIntegration = new Release();

    let eventProcessor: EventProcessor = () => null;

    // @ts-expect-error Mock
    addEventProcessor.mockImplementation(e => (eventProcessor = e));
    releaseIntegration.setupOnce();

    const client = getClient();

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      release: 'options_release',
    }));

    const event = await eventProcessor({}, {});

    expect(event?.release).toBe('options_release');
    expect(event?.dist).toBe('native_build');
  });

  test('Uses release and dist from options', async () => {
    const releaseIntegration = new Release();

    let eventProcessor: EventProcessor = () => null;

    // @ts-expect-error Mock
    addEventProcessor.mockImplementation(e => (eventProcessor = e));
    releaseIntegration.setupOnce();

    expect(addEventProcessor).toBeCalled();

    const client = getClient();

    // @ts-expect-error Mock
    client.getOptions.mockImplementation(() => ({
      dist: 'options_dist',
      release: 'options_release',
    }));

    const event = await eventProcessor({}, {});

    expect(event?.release).toBe('options_release');
    expect(event?.dist).toBe('options_dist');
  });
});
