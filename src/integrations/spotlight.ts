import { spotlightBrowserIntegration } from '@sentry/browser';
import type { Integration } from '@sentry/core';
import type { CapacitorOptions } from 'src/options';
import { CAP_GLOBAL_OBJ } from '../utils/webViewUrl';


export type SpotlightOptions = Parameters<typeof spotlightBrowserIntegration>[0];


/**
 * Use this integration to send errors and transactions to Spotlight.
 *
 * When testing on a mobile or simulator, you must set the sidecarUrl to the URL where the Spotlight sidecar is running.
 * Learn more about spotlight at https://spotlightjs.com
 *
 * @param spotlightOptions - Options for the Spotlight integration, URL should be `http://IP:8969/stream` where IP is your private IP address.
 * @example
 * import { spotlightIntegration } from '@sentry/capacitor';
 * spotlightIntegration({
 *   sidecarUrl: 'http://192.168.8.150:8969/stream',
 * });
 *
 * @note Don't forget to allow the port 8969 for TCP in your firewall if you are testing a physical device or a simulator that is on anodther device.
 */
export function spotlightIntegration(spotlightOptions: SpotlightOptions | undefined): Integration {

  // Required to cache it since we can only initialize the Native Sidecar during Native init.
  // This integration will be called before the SDK is initialized so Options/Clients will not be available.
  if (spotlightOptions?.sidecarUrl) {
    CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL = spotlightOptions.sidecarUrl;
  }

  return {
    name: 'Spotlight',
    setup(client) {
      const options = client.getOptions() as CapacitorOptions;
      if (options.enableNative !== true) {
        spotlightBrowserIntegration(spotlightOptions);
        return;
      }
      // Native setup is not done here but set in wrapper.ts when initalizing the SDK.
    },
  };
}
