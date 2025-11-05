import { type Integration,consoleLoggingIntegration } from '@sentry/core';
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
  integrations.push(consoleLoggingIntegration());

  if (options.enableNative) {
    integrations.push(deviceContextIntegration());
  }

  return integrations;
}
