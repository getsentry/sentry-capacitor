import { BrowserOptions } from '@sentry/browser';
import { BrowserBackend } from '@sentry/browser/dist/backend';
import { BaseBackend, getCurrentHub } from '@sentry/core';
import { forget, getGlobalObject } from '@sentry/utils';

import { Capacitor, Plugins } from '@capacitor/core';

import { CapacitorOptions } from './options';

const SentryCapacitor = Plugins;

/**
 * The Sentry Capacitor SDK Backend.
 */
export class CapacitorBackend extends BaseBackend<BrowserOptions> {
  private readonly _browserBackend: BrowserBackend;

  /**
   * Creates a new Capacitor backend instance.
   */
  public constructor(protected readonly _options: CapacitorOptions = {}) {
    super(_options);
    this._browserBackend = new BrowserBackend(_options);

    if (this._isCapacitor() && _options.enableNative !== false) {
      this._runNativeInstall();
    }
  }

  // CAPACITOR -----------------
  /**
   * Uses reference to the plugin to call Capacitor functions
   * @param action name of the action
   * @param args Arguments
   */
  private async _nativeCall(action: string, ...args: any[]): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      if (this._options.enableNative === false) {
        reject('enableNative = false, using browser transport');
        return;
      }

      try {
        window['SentryCapacitor'][`${action}`](args);
      } catch (error) {
        reject('Capacitor is not available. ' + error);
      }
    });
  }

  /**
   * Calling into native install function
   */
  private _runNativeInstall(): void {
    if (this._options.dsn && this._options.enabled !== false) {
      forget(this._nativeCall('install', this._options.dsn, this._options));
    }

    const scope = getCurrentHub().getScope();
    if (scope) {
      scope.addScopeListener(internalScope => {
        this._nativeCall('setExtraContext', (internalScope as any)._extra);

        this._nativeCall('setTagsContext', (internalScope as any)._tags);

        this._nativeCall('setUserContext', (internalScope as any)._user);

        this._nativeCall(
          'addBreadcrumb',
          (internalScope as any)._breadcrumbs.pop(),
        );
      });
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
}
