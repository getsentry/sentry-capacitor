import { defaultIntegrations, init as browserInit } from '@sentry/browser';
import { Hub, makeMain } from '@sentry/hub';

import { CapacitorOptions } from './options';
import { CapacitorScope } from './scope';
import { NativeTransport } from './transports/native';
import { NATIVE } from './wrapper';

const DEFAULT_OPTIONS: CapacitorOptions = {
  enableNative: true,
};

/**
 *
 */
export function init(
  _options: CapacitorOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalInit: (options: any) => void = browserInit,
): void {
  const options = {
    ...DEFAULT_OPTIONS,
    ..._options,
  };

  const capacitorHub = new Hub(undefined, new CapacitorScope());
  makeMain(capacitorHub);

  options.defaultIntegrations = [...defaultIntegrations];

  if (typeof options.enableNative === 'undefined') {
    options.enableNative = true;
  }

  if (options.enableNative && !options.transport) {
    options.transport = NativeTransport;
  }

  originalInit(options);

  void NATIVE.initNativeSdk(options);
}

/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash(): void {
  NATIVE.crash();
}
