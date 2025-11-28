import type { BrowserOptions } from '@sentry/browser';
import { init as browserInit } from '@sentry/browser';
import type { Integration } from '@sentry/core';
import { debug, getClient, getGlobalScope, getIntegrationsToSetup, getIsolationScope  } from '@sentry/core';
import { sdkInit } from './client';
import { getDefaultIntegrations } from './integrations/default';
import type { CapacitorClientOptions, CapacitorOptions } from './options';
import { enableSyncToNative } from './scopeSync';
import { useEncodePolyfill } from './transports/encodePolyfill';
import { DEFAULT_BUFFER_SIZE, makeNativeTransport } from './transports/native';
import { safeFactory } from './utils/safeFactory';
import { IsTextEncoderAvailable } from './utils/textEncoder';
import { NATIVE } from './wrapper';

/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export function init(
  passedOptions: CapacitorOptions,
  originalInit: (passedOptions:BrowserOptions) => void = browserInit,
): void {

  const finalOptions = {
    enableAutoSessionTracking: true,
    enableWatchdogTerminationTracking: true,
    enableCaptureFailedRequests: false,
    ...passedOptions,
  };
  finalOptions.siblingOptions && delete finalOptions.siblingOptions;

  if (finalOptions.enabled === false || NATIVE.platform === 'web') {
    finalOptions.enableNative = false;
    finalOptions.enableNativeNagger = false;
  } else {
    // keep the original value if user defined it.
    finalOptions.enableNativeNagger ??= true;
    finalOptions.enableNative ??= true;
  }
  //  const capacitorHub = new Hub(undefined, new CapacitorScope());
  //  makeMain(capacitorHub);
  const defaultIntegrations: false | Integration[] =
passedOptions.defaultIntegrations === undefined
      ? getDefaultIntegrations(passedOptions)
: passedOptions.defaultIntegrations;

  finalOptions.integrations = getIntegrationsToSetup({
integrations: safeFactory(passedOptions.integrations, {
      loggerMessage: 'The integrations threw an error',
    }),
    defaultIntegrations,
  });

  if (
    finalOptions.enableNative &&
!passedOptions.transport &&
    NATIVE.platform !== 'web'
  ) {
finalOptions.transport = passedOptions.transport || makeNativeTransport;

    finalOptions.transportOptions = {
...(passedOptions.transportOptions ?? {}),
      bufferSize: DEFAULT_BUFFER_SIZE,
    };
  }

  if (!IsTextEncoderAvailable()) {
    useEncodePolyfill();
  }

  if (finalOptions.enableNative) {
    enableSyncToNative(getGlobalScope());
    enableSyncToNative(getIsolationScope());
  }

  const browserOptions = {
    ...passedOptions.siblingOptions?.vueOptions,
    ...passedOptions.siblingOptions?.nuxtClientOptions,
    ...finalOptions,
    autoSessionTracking:
      NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking,
  } as BrowserOptions;

  const mobileOptions = {
    ...finalOptions,
    enableAutoSessionTracking:
      NATIVE.platform !== 'web' && finalOptions.enableAutoSessionTracking,
  } as CapacitorClientOptions;

  sdkInit(browserOptions, mobileOptions, originalInit, passedOptions.transport);
}

/**
 * Closes the SDK, stops sending events.
 */
export async function close(): Promise<void> {
  try {
    const client = getClient();

    if (client) {
      await client.close();
      await NATIVE.closeNativeSdk();
    }
  } catch (e) {
    debug.error('Failed to close the SDK');
  }
}

/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash(): void {
  NATIVE.crash();
}
