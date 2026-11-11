import type { BrowserOptions, makeFetchTransport } from '@sentry/browser';
import { debug, getClient, getGlobalScope, getIsolationScope } from '@sentry/core';
import { defaultNativeLogHandler, setupNativeLogListener } from './NativeLogListener';
import type { CapacitorOptions } from './options';
import { disableSyncToNative } from './scopeSync';
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
 * @param _customTransport - Unused, kept for backwards compatibility.
 */
export function sdkInit(
  browserOptions: BrowserOptions,
  nativeOptions: CapacitorOptions,
  originalInit: (passedOptions: BrowserOptions) => void,
  _customTransport?: TransportFactory): void {
  // Start the native SDK first (without awaiting it) so that the bridge call is
  // queued before any call made by the JS client.
  const nativeInit = initNativeSdk(nativeOptions);

  originalInit(browserOptions);
  PostSetupCapacitorClient();

  nativeInit
    .then(didCallNativeInit => {
      try {
        nativeOptions.onReady?.({ didCallNativeInit });
      } catch (error) {
        debug.error('The onReady callback threw an error: ', error);
      }
      // `afterInit` is not part of the core client's typed hooks (same as in React Native).
      (getClient() as { emit?: (hook: string) => void } | undefined)?.emit?.('afterInit');
    })
    .catch((error: Error) => {
      debug.error('An afterInit listener threw an error: ', error);
    });
}

/**
 * Starts the native SDK in the background and registers the pending init on NATIVE,
 * so the native transport can wait for it.
 */
function initNativeSdk(nativeOptions: CapacitorOptions): Promise<boolean> {
  // Listen before starting native so logs emitted during native init are not missed.
  if (nativeOptions.debug) {
    const logHandler = nativeOptions.onNativeLog ?? defaultNativeLogHandler;
    setupNativeLogListener(logHandler);
  }

  const nativeInit = NATIVE.initNativeSdk(nativeOptions)
    .then(result => result !== false)
    .catch((error: Error) => {
      // Fallback to JavaScript only: events go through the fetch transport.
      // eslint-disable-next-line no-console
      console.error('Native Sentry SDK failed to initialize. Using Sentry JavaScript SDK without native integration.\n', { error });
      disableSyncToNative(getGlobalScope());
      disableSyncToNative(getIsolationScope());
      return false;
    });
  NATIVE.nativeReady = nativeInit;
  return nativeInit;
}
