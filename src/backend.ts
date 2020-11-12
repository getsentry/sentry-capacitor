import { BrowserOptions, Transports } from '@sentry/browser';
import { BrowserBackend } from '@sentry/browser/dist/backend';
import { BaseBackend, NoopTransport } from '@sentry/core';

import { CapacitorOptions } from './options';
import { NativeTransport } from './transports/native';
import { NATIVE } from './wrapper';

declare const global: any;

/**
 * The Sentry Capacitor SDK Backend.
 */
export class CapacitorBackend extends BaseBackend<BrowserOptions> {
  // @ts-ignore
  private readonly _browserBackend: BrowserBackend;

  /**
   * Creates a new Capacitor backend instance.
   */
  public constructor(protected readonly _options: CapacitorOptions) {
    super(_options);
    this._browserBackend = new BrowserBackend(_options);

    void this._startWithOptions();
  }

  /**
   * If native client is available it will trigger a native crash.
   * Use this only for testing purposes.
   */
  public nativeCrash(): void {
    if (this._options.enableNative) {
      NATIVE.crash();
    }
  }

  /**
   * @inheritDoc
   */
  protected _setupCapacitorTransport(): Transport | NoopTransport {
    if (!this._options.dsn) {
      // We return the noop transport here in case there is no Dsn.
      return new NoopTransport();
    }

    const transportOptions = {
      ...this._options.transportOptions,
      dsn: this._options.dsn,
    };

    if (this._options.transport) {
      return new this._options.transport(transportOptions);
    }

    if (this._isNativeTransportAvailable()) {
      return new NativeTransport();
    }

    return new Transports.FetchTransport(transportOptions);
  }

  /**
   * Has Capacitor on window?
   */
  // private _isCapacitor(): boolean {
  //   return (
  //     getGlobalObject<any>().capacitor !== undefined ||
  //     getGlobalObject<any>().Capacitor !== undefined
  //   );
  // }

  /**
   * If true, native client is availabe and active
   */
  private _isNativeTransportAvailable(): boolean {
    return (
      this._options.enableNative === true &&
      NATIVE.isNativeClientAvailable() &&
      NATIVE.isNativeTransportAvailable()
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
