import { BrowserOptions } from '@sentry/browser';
import { BrowserBackend } from '@sentry/browser/dist/backend';
import { BaseBackend } from '@sentry/core';
import { getGlobalObject } from '@sentry/utils';

import { Capacitor, Plugins } from '@capacitor/core';

import { CapacitorOptions } from './options';
import { NATIVE } from './wrapper';

const SentryCapacitor = Plugins;

declare const global: any;

/**
 * The Sentry Capacitor SDK Backend.
 */
export class CapacitorBackend extends BaseBackend<BrowserOptions> {
  private readonly _browserBackend: BrowserBackend;

  /**
   * Creates a new Capacitor backend instance.
   */
  public constructor(protected readonly _options: CapacitorOptions) {
    super(_options);
    this._browserBackend = new BrowserBackend(_options);

    if (this._isCapacitor() && _options.enableNative !== false) {
      void this._startWithOptions();
    }
  }

  /**
   * Has Capacitor on window?
   */
  private _isCapacitor(): boolean {
    return (
      getGlobalObject<any>().capacitor !== undefined ||
      getGlobalObject<any>().Capacitor !== undefined
    );
  }

  /**
   * Starts native client with dsn and options
   */
  private async _startWithOptions(): Promise<void> {
    try {
      await NATIVE.startWithOptions(this._options);
      NATIVE.setLogLevel(this._options.debug ? 2 : 1);
    } catch (_) {
      this._showCannotConnectDialog();
    }
  }

  /**
   * If the user is in development mode, and the native nagger is enabled, then it will show an alert
   */
  private _showCannotConnectDialog(): void {
    if (global.__DEV__ && this._options.enableNativeNagger) {
      alert(
        'Warning, could not connect to Sentry native SDK.\nIf you do not want to use the native component please pass `enableNative: false` in the options.\nVisit: https://docs.sentry.io/platforms/capacitor/#linking for more details.',
      );
    }
  }
}
