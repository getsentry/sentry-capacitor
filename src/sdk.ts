import type { BrowserOptions } from '@sentry/browser';
import { init as browserInit } from '@sentry/browser';
import { debug, getClient, getGlobalScope, getIsolationScope } from '@sentry/core';
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
  originalInit: (passedOptions: BrowserOptions) => void = browserInit,
): void {

  /**
   * Shared options are the options that are shared between the browser and native SDKs.
   */
  const sharedOptions = {
    enableAutoSessionTracking: true,
    enableWatchdogTerminationTracking: true,
    enableCaptureFailedRequests: false,
    ...passedOptions,
  };
  sharedOptions.siblingOptions && delete sharedOptions.siblingOptions;

  if (sharedOptions.enabled === false || NATIVE.platform === 'web') {
    sharedOptions.enableNative = false;
    sharedOptions.enableNativeNagger = false;
  } else {
    // keep the original value if user defined it.
    sharedOptions.enableNativeNagger ??= true;
    sharedOptions.enableNative ??= true;
  }

  if (
    sharedOptions.enableNative &&
    !passedOptions.transport &&
    NATIVE.platform !== 'web'
  ) {
    sharedOptions.transport = passedOptions.transport || makeNativeTransport;

    sharedOptions.transportOptions = {
      ...(passedOptions.transportOptions ?? {}),
      bufferSize: DEFAULT_BUFFER_SIZE,
    };
  }

  if (!IsTextEncoderAvailable()) {
    useEncodePolyfill();
  }

  if (sharedOptions.enableNative) {
    enableSyncToNative(getGlobalScope());
    enableSyncToNative(getIsolationScope());
  }

  /**
   * Browser options are the options that are only used by the browser SDK.
   */
  const browserOptions = {
    ...passedOptions.siblingOptions?.vueOptions,
    ...passedOptions.siblingOptions?.nuxtClientOptions,
    ...sharedOptions,
    integrations: safeFactory(passedOptions.integrations, { loggerMessage: 'The integrations threw an error' }),
    enableMetrics: sharedOptions._experiments?.enableMetrics,
    beforeSendMetric: sharedOptions._experiments?.beforeSendMetric,
  } as BrowserOptions;


  browserOptions.defaultIntegrations = passedOptions.defaultIntegrations === undefined
    ? getDefaultIntegrations(sharedOptions)
    : passedOptions.defaultIntegrations;

  /**
   * Mobile options are the options that are only used by the native SDK.
   */
  const mobileOptions = {
    ...sharedOptions,
    enableAutoSessionTracking:
      NATIVE.platform !== 'web' && sharedOptions.enableAutoSessionTracking,
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
