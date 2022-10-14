import {
  defaultIntegrations,
  init as browserInit,
  StackFrame,
} from '@sentry/browser';
import { Hub, makeMain } from '@sentry/core';
import { RewriteFrames } from '@sentry/integrations';

import { DeviceContext, EventOrigin, SdkInfo } from './integrations';
import { CapacitorOptions } from './options';
import { CapacitorScope } from './scope';
import { makeCapacitorTransport } from './transports/native';
import { NATIVE } from './wrapper';

/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export function init<O>(
  options: CapacitorOptions & O,
  originalInit: (options: O) => void = browserInit,
): void {
  const finalOptions = {
    enableAutoSessionTracking: true,
    enableOutOfMemoryTracking: true,
    ...options,
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
    new RewriteFrames({
      iteratee: (frame: StackFrame) => {
        if (frame.filename) {
          const isReachableHost = /^https?:\/\//.test(frame.filename);

          frame.filename = frame.filename
            .replace(/^https?:\/\/localhost(:\d+)?/, '')
            .replace(/^ng:\/\//, '')
            .replace(/^capacitor:\/\/localhost(:\d+)?/, '');

          const isNativeFrame = frame.filename === '[native code]' || frame.filename === 'native';

          if (!isNativeFrame) {
            // We don't need to use `app://` protocol for http(s) based hosts
            if (!isReachableHost) {
              // We always want to have a triple slash
              const filename = frame.filename.startsWith('/') ? frame.filename : `/${frame.filename}`;
              const appPrefix = 'app://';
              frame.filename = `${appPrefix}${filename}`;
            }

            frame.in_app = true;
          } else {
            frame.in_app = false;
          }
        }
        return frame;
      },
    }),
    new SdkInfo(),
    new EventOrigin(),
  ];

  if (finalOptions.enableNative) {
    finalOptions.defaultIntegrations.push(new DeviceContext());

    if (!options.transport && NATIVE.platform !== 'web') {
      finalOptions.transport = options.transport || makeCapacitorTransport;
    }
  }

  const browserOptions = {
    ...finalOptions,
    autoSessionTracking:
      NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking,
  } as O;

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
