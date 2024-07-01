import type { Event, Integration, Package } from '@sentry/types';
import { logger } from '@sentry/utils';

import { SDK_NAME, SDK_VERSION } from '../version';
import { NATIVE } from '../wrapper';

const INTEGRATION_NAME = 'SdkInfo';

let NativeSdkPackage: Package | null = null;

export const sdkInfoIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    setupOnce: () => {
      // noop
    },
    preprocessEvent: processEvent,
  };
};

async function processEvent(event: Event): Promise<Event> {
  // The native SDK info package here is only used on iOS as `beforeSend` is not called on `captureEnvelope`.
  // this._nativeSdkInfo should be defined a following time so this call won't always be awaited.
  if (NATIVE.platform === 'ios' && NativeSdkPackage === null) {
    try {
      NativeSdkPackage = await NATIVE.fetchNativeSdkInfo();
    } catch (_) {
      // If this fails, go ahead as usual as we would rather have the event be sent with a package missing.
      logger.warn(
        '[SdkInfo] Native SDK Info retrieval failed...something could be wrong with your Sentry installation.',
      );
    }
  }

  event.platform = event.platform || 'javascript';
  event.sdk = event.sdk || {};
  event.sdk.name = event.sdk.name || SDK_NAME;
  event.sdk.version = event.sdk.version || SDK_VERSION;
  event.sdk.packages = [
    // default packages are added by baseclient and should not be added here
    ...(event.sdk.packages || []),
    ...((NativeSdkPackage && [NativeSdkPackage]) || []),
    {
      name: 'npm:@sentry/capacitor',
      version: SDK_VERSION,
    },
  ];

  return event;
}
