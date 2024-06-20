import type { Integration } from '@sentry/types';

import type { CapacitorOptions } from '../options';
import { deviceContextIntegration } from './devicecontext';
import { eventOriginIntegration } from './eventorigin';
import { releaseIntegration } from './release';
import { capacitorRewriteFramesIntegration } from './rewriteframes';
import { sdkInfoIntegration } from './sdkinfo';

/**
 * Returns the default Capacitor integrations based on the current environment.
 */
export function getDefaultIntegrations(
  options: CapacitorOptions,
): Integration[] {
  const integrations: Integration[] = [];

  integrations.push(capacitorRewriteFramesIntegration);
  integrations.push(releaseIntegration);
  integrations.push(sdkInfoIntegration);
  integrations.push(eventOriginIntegration);

  if (options.enableNative) {
    integrations.push(deviceContextIntegration);
  }

  return integrations;
}
