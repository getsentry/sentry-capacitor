import type {
  BaseTransportOptions,
  Client,
  ClientOptions,
  Event,
  EventHint,
  Integration,
} from '@sentry/core';

import { NATIVE } from '../wrapper';

const INTEGRATION_NAME = 'Release';

export const nativeReleaseIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    processEvent: processEvent,
  };
};

async function processEvent(
  event: Event,
  _: EventHint,
  client: Client<ClientOptions<BaseTransportOptions>>,
): Promise<Event> {
  const options = client.getOptions();
  /*
    Check for the release and dist in the options passed on init.
    Otherwise, we get the release and dist from the native package.
  */
  if (typeof options?.release === 'string') {
    event.release = options.release;
  }

  if (typeof options?.dist === 'string') {
    event.dist = options.dist;
  }

  if (event.release && event.dist) {
    return event;
  }

  try {
    const nativeRelease = await NATIVE.fetchNativeRelease();
    if (nativeRelease) {
      if (!event.release) {
        event.release = `${nativeRelease.id}@${nativeRelease.version}+${nativeRelease.build}`;
      }
      if (!event.dist) {
        event.dist = `${nativeRelease.build}`;
      }
    }
  } catch (_Oo) {
    // Something went wrong, we just continue
  }

  return event;
}
