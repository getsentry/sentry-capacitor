import type { BrowserOptions, makeFetchTransport } from '@sentry/browser';
import { getClient } from '@sentry/core';
import type { CapacitorOptions } from './options';
import { RestoreNonNativeOptions } from './utils/optionsUtils';
import { SDK_NAME, SDK_VERSION } from './version';
import { NATIVE } from './wrapper';

// Direct reference of BrowserTransportOptions is not compatible with strict builds of latest versions of Typescript 5.
type BrowserTransportOptions = Parameters<typeof makeFetchTransport>[0];
type TransportFactory = (transportOptions: BrowserTransportOptions) => ReturnType<typeof makeFetchTransport>;

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
 * Initializes the Sibling and Native Sentry SDKs.
 * @param browserOptions - The browser options to use for the sibling SDK.
 * @param nativeOptions - The native options to use for the native SDK.
 * @param originalInit - The original init function to use for the sibling SDK.
 * @param customTransport - The custom transport to use.
 */
export function sdkInit(
  browserOptions: BrowserOptions,
  nativeOptions: CapacitorOptions,
  originalInit: (passedOptions: BrowserOptions) => void,
  customTransport?: TransportFactory): void {
  // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
  // feature from the NATIVE SDK without the options being set.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  NATIVE.initNativeSdk(nativeOptions)
    .then(() => {
      originalInit(browserOptions);
    }).catch((error: Error) => {
      // Fallback to JavaScript only SDK Init.
      // eslint-disable-next-line no-console
      console.error('Native Sentry SDK failed to initialize. Using Sentry JavaScript SDK without native integraiton.\n', { error });
      RestoreNonNativeOptions(browserOptions, customTransport);
      originalInit(browserOptions);
    }).finally(() => {
      PostSetupCapacitorClient();
    });
}
