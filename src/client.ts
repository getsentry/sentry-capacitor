import { BaseClient } from '@sentry/core';

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
   * If native client is available it will trigger a native crash.
   * Use this only for testing purposes.
   */
  public nativeCrash(): void {
    this._getBackend().nativeCrash();
  }
}
