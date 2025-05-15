import type { Contexts, Event, Integration } from '@sentry/types';
import { logger } from '@sentry/utils';

import { NATIVE } from '../wrapper';

const INTEGRATION_NAME = 'DeviceContext';

export const deviceContextIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    processEvent: processEvent,
  };
};

async function processEvent(event: Event): Promise<Event> {
  try {
    const contexts = await NATIVE.fetchNativeDeviceContexts();
    const context = contexts['context'] as Contexts;

    event.contexts = { ...context, ...event.contexts };
    if ('user' in contexts) {
      const user = contexts['user'];
      if (!event.user) {
        event.user = { ...user };
      }
    }
  } catch (e) {
    logger.log(`Failed to get device context from native: ${e}`);
  }

  return event;
}
