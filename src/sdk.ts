import {
  defaultIntegrations,
  init as browserInit,
  StackFrame,
} from '@sentry/browser';
import { Hub, makeMain } from '@sentry/hub';
import { RewriteFrames } from '@sentry/integrations';

import { CapacitorOptions } from './options';
import { CapacitorScope } from './scope';
import { NativeTransport } from './transports/native';
import { NATIVE } from './wrapper';

const DEFAULT_OPTIONS: CapacitorOptions = {
  enableNative: true,
  enableNativeNagger: true,
};

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
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const capacitorHub = new Hub(undefined, new CapacitorScope());
  makeMain(capacitorHub);

  finalOptions.defaultIntegrations = [
    ...defaultIntegrations,
    new RewriteFrames({
      iteratee: (frame: StackFrame) => {
        if (frame.filename) {
          frame.filename = frame.filename
            .replace(/^http:\/\/localhost/, '')
            .replace(/^ng:\/\//, '');

          if (
            frame.filename !== '[native code]' &&
            frame.filename !== 'native'
          ) {
            const appPrefix = 'app://';
            // We always want to have a triple slash
            frame.filename =
              frame.filename.indexOf('/') === 0
                ? `${appPrefix}${frame.filename}`
                : `${appPrefix}/${frame.filename}`;

            frame.in_app = true;
          } else {
            frame.in_app = false;
          }
        }
        return frame;
      },
    }),
  ];

  if (typeof finalOptions.enableNative === 'undefined') {
    finalOptions.enableNative = true;
  }

  if (finalOptions.enableNative && !options.transport) {
    finalOptions.transport = NativeTransport;
  }

  originalInit(finalOptions);

  void NATIVE.initNativeSdk(finalOptions);
}

/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash(): void {
  NATIVE.crash();
}
