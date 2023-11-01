import type { StackFrame } from '@sentry/browser';
import {
  defaultIntegrations,
  init as browserInit
} from '@sentry/browser';
import { Hub, makeMain } from '@sentry/core';
import { RewriteFrames } from '@sentry/integrations';

import { DeviceContext, EventOrigin, Release, SdkInfo } from './integrations';
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
export function init<O>(
  passedOptions: CapacitorOptions & O,
  originalInit: (passedOptions: O) => void = browserInit,
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
    new RewriteFrames({
      iteratee: (frame: StackFrame) => {
        if (frame.filename) {
          const isReachableHost = /^https?:\/\//.test(frame.filename);
          frame.filename = frame.filename
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, no-restricted-globals
            .replace((window as any).WEBVIEW_SERVER_URL, '')
            .replace(/^ng:\/\//, '');
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
