import { EventProcessor, Integration } from '@sentry/types';

import { SDK_NAME, SDK_VERSION } from '../version';

/** Default SdkInfo instrumentation */
export class SdkInfo implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = 'SdkInfo';

  /**
   * @inheritDoc
   */
  public name: string = SdkInfo.id;

  /**
   * @inheritDoc
   */
  public setupOnce(addGlobalEventProcessor: (e: EventProcessor) => void): void {
    addGlobalEventProcessor(event => {
      event.platform = event.platform || 'javascript';
      event.sdk = {
        ...event.sdk,
        name: SDK_NAME,
        packages: [
          ...((event.sdk && event.sdk.packages) || []),
          {
            name: 'npm:@sentry/capacitor',
            version: SDK_VERSION,
          },
        ],
        version: SDK_VERSION,
      };

      return event;
    });
  }
}
