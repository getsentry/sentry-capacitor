import { defaultIntegrations } from '@sentry/browser';
import { initAndBind } from '@sentry/core';
import { getCurrentHub, Hub, makeMain } from '@sentry/hub';

import { CapacitorClient } from './client';
// import { CapacitorErrorHandlers, Release } from './integrations';
import {  Release } from './integrations';
import { CapacitorOptions } from './options';
import { CapacitorScope } from './scope';

const DEFAULT_OPTIONS: CapacitorOptions = {
  enableNative: true,
  enableNativeNagger: true,
};

/**
 * Inits the SDK
 */
export function init(
  passedOptions: CapacitorOptions = {
    enableNative: true,
    enableNativeNagger: true,
  },
): void {
  const capacitorHub = new Hub(undefined, new CapacitorScope());
  makeMain(capacitorHub);

  const options = {
    ...DEFAULT_OPTIONS,
    ...passedOptions,
  };

  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = [
      // new CapacitorErrorHandlers(),
      new Release(),
      ...defaultIntegrations,
    ];
  }

  initAndBind(CapacitorClient, options);

  // set the event.origin tag.
  getCurrentHub().setTag('event.origin', 'javascript');
}
