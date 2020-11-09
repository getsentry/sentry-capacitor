import { SDK_NAME, SDK_VERSION } from '@sentry/browser';
import { BaseClient, Scope } from '@sentry/core';
import { Event, EventHint } from '@sentry/types';
import { SyncPromise } from '@sentry/utils';

import { CapacitorBackend } from './backend';
import { CapacitorOptions } from './options';

/**
 * The Sentry Capacitor SDK Client.
 */
export class CapacitorClient extends BaseClient<
  CapacitorBackend,
  CapacitorOptions
> {
  /**
   * Creates a new Capacitor SDK instance.
   * @params options Configuration options for this SDK.
   */
  public constructor(options: CapacitorOptions) {
    super(CapacitorBackend, options);
  }

  /**
   * @inheritDoc
   */
  protected _prepareEvent(
    event: Event,
    scope?: Scope,
    hint?: EventHint,
  ): SyncPromise<Event | null> {
    event.platform = event.platform || 'javascript';
    event.sdk = {
      ...event.sdk,
      name: SDK_NAME,
      packages: [
        ...((event.sdk && event.sdk.packages) || []),
        {
          name: 'npm:sentry-capacitor',
          version: SDK_VERSION,
        },
      ],
      version: SDK_VERSION,
    };

    return super._prepareEvent(event, scope, hint);
  }
}
