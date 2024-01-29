import type { BrowserOptions } from '@sentry/browser';
import {
  defaultIntegrations,
  init as browserInit
} from '@sentry/browser';
import { Hub, makeMain } from '@sentry/core';

import { DeviceContext, EventOrigin, Release, SdkInfo } from './integrations';
import { createCapacitorRewriteFrames } from './integrations/rewriteframes';
import type { CapacitorOptions } from './options';
import { CapacitorScope } from './scope';
import { DEFAULT_BUFFER_SIZE, makeNativeTransport } from './transports/native';
import { makeUtf8TextEncoder } from './transports/TextEncoder';
import { NATIVE } from './wrapper';

/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export function init<T>(
  passedOptions: CapacitorOptions & T,
  originalInit: (passedOptions: T & BrowserOptions) => void = browserInit,
): void {
  const finalOptions = {
    enableAutoSessionTracking: true,
    enableWatchdogTerminationTracking: true,
    ...passedOptions,
  };
  if (finalOptions.enabled === false ||
    NATIVE.platform === 'web') {
    finalOptions.enableNative = false;
    finalOptions.enableNativeNagger = false;
  } else {
    // keep the original value if user defined it.
    finalOptions.enableNativeNagger ??= true;
    finalOptions.enableNative ??= true;
  }

  const capacitorHub = new Hub(undefined, new CapacitorScope());
  makeMain(capacitorHub);

  finalOptions.defaultIntegrations = [
    ...defaultIntegrations,
    createCapacitorRewriteFrames(),
    new Release(),
    new SdkInfo(),
    new EventOrigin(),
  ];

  if (finalOptions.enableNative) {
    finalOptions.defaultIntegrations.push(new DeviceContext());

    if (!passedOptions.transport && NATIVE.platform !== 'web') {
      finalOptions.transport = passedOptions.transport
        || makeNativeTransport;

      finalOptions.transportOptions = {
        ...{ textEncoder: makeUtf8TextEncoder() },
        ...(passedOptions.transportOptions ?? {}),
        bufferSize: DEFAULT_BUFFER_SIZE,
      };
    }
  }

  const browserOptions = {
    ...finalOptions,
    autoSessionTracking:
      NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking,
  } as BrowserOptions & T;

  const mobileOptions = {
    ...finalOptions,
    enableAutoSessionTracking:
      NATIVE.platform !== 'web' && finalOptions.enableAutoSessionTracking,
  } as CapacitorOptions;

  // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
  // feature from the NATIVE SDK without the options being set.
  void NATIVE.initNativeSdk(mobileOptions);
  originalInit(browserOptions);
}

/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash(): void {
  NATIVE.crash();
}
