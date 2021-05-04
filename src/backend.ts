import { BrowserOptions, Transports } from '@sentry/browser';
import { BrowserBackend } from '@sentry/browser/dist/backend';
import { BaseBackend, NoopTransport } from '@sentry/core';
import { Event, EventHint, Severity, Transport } from '@sentry/types';
import { logger } from '@sentry/utils';

import { CapacitorOptions } from './options';
import { NativeTransport } from './transports/native';
import { NATIVE } from './wrapper';

/**
 * The Sentry Capacitor SDK Backend.
 */
export class CapacitorBackend extends BaseBackend<BrowserOptions> {
  // @ts-ignore IDE thinks this variable is never called, but it is initialized in the constructure below
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
  public eventFromException(
    exception: unknown,
    hint?: EventHint,
  ): PromiseLike<Event> {
    return this._browserBackend.eventFromException(exception, hint);
  }

  /**
   * @inheritDoc
   */
  public eventFromMessage(
    message: string,
    level: Severity = Severity.Info,
    hint?: EventHint,
  ): PromiseLike<Event> {
    /* eslint-disable no-console */
    return this._browserBackend.eventFromMessage(message, level, hint);
  }

  /**
   * @inheritDoc
   */
  protected _setupTransport(): Transport | NoopTransport {
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

    if (this._isNativeClientAvailable()) {
      return new NativeTransport();
    }

    return new Transports.FetchTransport(transportOptions);
  }

  /**
   * If true, native client is availabe and active
   */
  private _isNativeClientAvailable(): boolean {
    return (
      this._options.enableNative === true && NATIVE.isNativeClientAvailable()
    );
  }

  /**
   * Starts native client with dsn and options
   */
  private async _startWithOptions(): Promise<void> {
    try {
      await NATIVE.startWithOptions(this._options);
    } catch (error) {
      logger.error(error);
    }
  }
}
