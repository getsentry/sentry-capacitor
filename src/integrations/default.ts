import { breadcrumbsIntegration, browserApiErrorsIntegration, browserSessionIntegration, globalHandlersIntegration } from '@sentry/browser';
import { type Integration,dedupeIntegration, functionToStringIntegration, inboundFiltersIntegration, linkedErrorsIntegration } from '@sentry/core';
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
    // eslint-disable-next-line deprecation/deprecation
    inboundFiltersIntegration(),
    functionToStringIntegration(),
    // Web Only
    browserApiErrorsIntegration(),
    breadcrumbsIntegration(),
    globalHandlersIntegration(), // browser?
    linkedErrorsIntegration(), // ?
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
