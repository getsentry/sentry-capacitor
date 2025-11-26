import type { makeFetchTransport } from '@sentry/browser';
import { getGlobalScope, getIsolationScope } from '@sentry/core';
import type { CapacitorOptions } from '../options';
import { disableSyncToNative } from '../scopeSync';

// Direct reference of BrowserTransportOptions is not compatible with strict builds of latest versions of Typescript 5.
type BrowserTransportOptions = Parameters<typeof makeFetchTransport>[0];
type TransportFactory = (transportOptions: BrowserTransportOptions) => ReturnType<typeof makeFetchTransport>;

/**
 * Restores the non-native options to the original values.
 * @param options - The options to restore.
 * @param customTransport - The custom transport to use.
 */
export function RestoreNonNativeOptions(options: CapacitorOptions, customTransport?: TransportFactory | undefined): void {
  if (options.enableNative) {
    options.transport = customTransport;

    disableSyncToNative(getGlobalScope());
    disableSyncToNative(getIsolationScope());
  }
}
