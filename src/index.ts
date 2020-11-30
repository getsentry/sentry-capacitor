export * from './definitions';
export * from './web';

export {
  Breadcrumb,
  Request,
  SdkInfo,
  Event,
  Exception,
  Response,
  Severity,
  StackFrame,
  Stacktrace,
  Status,
  Thread,
  User,
} from '@sentry/types';

import { addGlobalEventProcessor } from '@sentry/core';
export {
  addGlobalEventProcessor,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
  configureScope,
  getHubFromCarrier,
  getCurrentHub,
  Hub,
  Scope,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  setUser,
  withScope,
} from '@sentry/core';

import * as Integrations from './integrations';
import { SDK_NAME, SDK_VERSION } from './version';

export { CapacitorBackend } from './backend';
export { CapacitorOptions } from './options';
export { CapacitorClient } from './client';

export { init, nativeCrash } from './sdk';

/**
 * Adds the SDK info. Make sure this is called after @sentry/capacitor's so this is the top-level SDK.
 */
function createCapacitorEventProcessor(): void {
  if (addGlobalEventProcessor) {
    addGlobalEventProcessor(event => {
      event.platform = event.platform || 'javascript';
      event.sdk = {
        ...event.sdk,
        name: SDK_NAME,
        packages: [
          ...((event.sdk && event.sdk.packages) || []),
          {
            name: 'npm:@sentry/capacitor',
            version: SDK_VERSION,
          },
        ],
        version: SDK_VERSION,
      };

      return event;
    });
  }
}

createCapacitorEventProcessor();

export { Integrations, SDK_NAME, SDK_VERSION };
