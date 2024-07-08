import type { Event, Integration } from '@sentry/types';

const INTEGRATION_NAME = 'EventOrigin';

export const eventOriginIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    preprocessEvent: processEvent,
  };
};

async function processEvent(event: Event): Promise<Event> {
  event.tags = event.tags ?? {};

  event.tags['event.origin'] = 'javascript';
  event.tags['event.environment'] = 'javascript';

  return event;
}
