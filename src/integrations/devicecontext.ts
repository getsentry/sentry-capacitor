import type { Client, Contexts, Event, EventHint, Integration } from '@sentry/core';
import { debug } from '@sentry/core';
import { breadcrumbFromObject } from '../breadcrumb';
import { NATIVE } from '../wrapper';

const INTEGRATION_NAME = 'DeviceContext';

export const deviceContextIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    processEvent: processEvent,
  };
};

async function processEvent(event: Event, _hint: EventHint, client: Client): Promise<Event> {
  try {
    const nativeContexts = await NATIVE.fetchNativeDeviceContexts();
    const context = nativeContexts['contexts'] as Contexts;

    event.contexts = { ...context, ...event.contexts };
    if ('user' in nativeContexts) {
      const user = nativeContexts['user'];
      if (!event.user) {
        event.user = { ...user };
      }
    }

      const nativeBreadcrumbs = Array.isArray(nativeContexts['breadcrumbs'])
    ? nativeContexts['breadcrumbs'].map(breadcrumbFromObject)
    : undefined;
  if (nativeBreadcrumbs) {
    const maxBreadcrumbs = client?.getOptions().maxBreadcrumbs ?? 100; // Default is 100.
    event.breadcrumbs = nativeBreadcrumbs
      .concat(event.breadcrumbs || []) // concatenate the native and js breadcrumbs
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)) // sort by timestamp
      .slice(-maxBreadcrumbs); // keep the last maxBreadcrumbs
  }

  } catch (e) {
    debug.log(`Failed to get device context from native: ${e}`);
  }

  return event;
}
