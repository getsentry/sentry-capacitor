import type { BrowserOptions } from '@sentry/browser';
import { getClient, logger } from '@sentry/core';
import type { CapacitorOptions } from './options';
import { SDK_NAME, SDK_VERSION } from './version';
import { NATIVE } from './wrapper';
/**
 * Post setup the Capacitor client
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PostSetupCapacitorClient() : void {
  const client = getClient();
  if (client) {
    const options = client.getOptions();
    if (!options._metadata?.sdk) {
      return;
    }
    const sdk = options._metadata.sdk;

    sdk.name = `${sdk.name}.capacitor`;
    sdk.version = SDK_VERSION;
    sdk.packages?.push(
    {
      name: SDK_NAME,
      version: SDK_VERSION
    });

    options._metadata.sdk = sdk;
  }
}

/**
 * Initializes the Sibling and Native Sentry SDKs
 */
export function sdkInit<T>(browserOptions: T & BrowserOptions, nativeOptions: CapacitorOptions, originalInit: (passedOptions: T & BrowserOptions) => void): void {
  // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
  // feature from the NATIVE SDK without the options being set.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  NATIVE.initNativeSdk(nativeOptions)
    .then(() => {
      originalInit(browserOptions);
      PostSetupCapacitorClient();
    }).catch((error) => {
      // Do something if Native init failed.
      logger.error(error);
    });
}
