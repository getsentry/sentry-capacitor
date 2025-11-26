import type { Event, Integration, Package, SdkInfo, SdkInfo as SdkInfoType } from '@sentry/core';
import { debug } from '@sentry/core';
import { SDK_NAME, SDK_VERSION } from '../version';
import { NATIVE } from '../wrapper';


type DefaultSdkInfo = Pick<Required<SdkInfoType>, 'name' | 'packages' | 'version'>;

export const defaultSdkInfo: DefaultSdkInfo = {
  name: SDK_NAME,
  packages: [
    {
      name: SDK_NAME,
      version: SDK_VERSION,
    },
  ],
  version: SDK_VERSION,
};


// TODO: Remove this on JS V10.
interface IpPatchedSdkInfo extends SdkInfo {
  settings?: {
    infer_ip?: 'auto' | 'never';
  };
}

const INTEGRATION_NAME = 'SdkInfo';

let NativeSdkPackage: Package | null = null;
let DefaultPii: boolean | undefined = undefined;

export const sdkInfoIntegration = (): Integration => {
  return {
    name: INTEGRATION_NAME,
    processEvent: processEvent,
    setup(client) {
      const options = client.getOptions();
      DefaultPii = options.sendDefaultPii;
      if (DefaultPii) {
        client.on('beforeSendEvent', (event => {
          if (event.user?.ip_address === '{{auto}}') {
            delete event.user.ip_address;
          }
        }));
      }
    }
  };
}

async function processEvent(event: Event): Promise<Event> {
  // The native SDK info package here is only used on iOS as `beforeSend` is not called on `captureEnvelope`.
  // this._nativeSdkInfo should be defined a following time so this call won't always be awaited.
  if (NATIVE.platform === 'ios' && NativeSdkPackage === null) {
    try {
      NativeSdkPackage = await NATIVE.fetchNativeSdkInfo();
    } catch (_) {
      // If this fails, go ahead as usual as we would rather have the event be sent with a package missing.
      debug.warn(
        '[SdkInfo] Native SDK Info retrieval failed...something could be wrong with your Sentry installation.',
      );
    }
  }

  event.platform = event.platform || 'javascript';
  const sdk = (event.sdk || {}) as IpPatchedSdkInfo;
  sdk.packages = [
    // default packages are added by baseclient and should not be added here
    ...(sdk.packages || []),
    ...((NativeSdkPackage && [NativeSdkPackage]) || []),
    {
      name: 'npm:@sentry/capacitor',
      version: SDK_VERSION,
    },
  ];

  // Patch missing infer_ip.
  sdk.settings = {
    infer_ip: DefaultPii ? 'auto' : 'never',
    // purposefully allowing already passed settings to override the default
    ...sdk.settings
  };

  event.sdk = sdk;

  return event;
}
