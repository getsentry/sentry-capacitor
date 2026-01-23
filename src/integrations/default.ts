import { breadcrumbsIntegration, browserApiErrorsIntegration, browserSessionIntegration, globalHandlersIntegration } from '@sentry/browser';
<<<<<<< HEAD
import { dedupeIntegration, eventFiltersIntegration, functionToStringIntegration, type Integration, linkedErrorsIntegration } from '@sentry/core';
=======
import { type Integration, dedupeIntegration, functionToStringIntegration, inboundFiltersIntegration, linkedErrorsIntegration } from '@sentry/core';
>>>>>>> 9103a4ff58acc7aad2f8a3f4866610008200f4d4
import type { CapacitorOptions } from '../options';
import { deviceContextIntegration } from './devicecontext';
import { eventOriginIntegration } from './eventorigin';
import { nativeReleaseIntegration } from './release';
import { capacitorRewriteFramesIntegration } from './rewriteframes';
import { sdkInfoIntegration } from './sdkinfo';

/**
 * Returns the default Capacitor integrations based on the current environment.
 */
export function getDefaultIntegrations(
  options: CapacitorOptions,
): Integration[] {
  const integrations: Integration[] = [];

  integrations.push(capacitorRewriteFramesIntegration());
  integrations.push(nativeReleaseIntegration());
  integrations.push(eventOriginIntegration());
  integrations.push(sdkInfoIntegration());

  if (options.enableNative) {
    integrations.push(deviceContextIntegration());
  }

  // @sentry/browser integrations
  integrations.push(
    eventFiltersIntegration(),
    functionToStringIntegration(),
    browserApiErrorsIntegration(),
    breadcrumbsIntegration(),
    globalHandlersIntegration(),
    linkedErrorsIntegration(),
    dedupeIntegration(),
  );

  if (options.enableAutoSessionTracking && !options.enableNative) {
    integrations.push(browserSessionIntegration());
  }
  // end @sentry/browser integrations

  // @sentry/vue integrations must be added manually.
  // @sentry/react, @sentry/angular @sentry/nuxt dont require any integrations.

  return integrations;
}
