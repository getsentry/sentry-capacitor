import { Plugins } from '@capacitor/core';
import { logger, SentryError } from '@sentry/utils';

import { CapacitorOptions } from './options';

const { SentryCapacitor } = Plugins;

/**
 * Internal interface for calling native functions
 */
export const NATIVE = {
  /**
   * Starts native with the provided options
   * @param options CapacitorOptions
   */
  async startWithOptions(
    options: CapacitorOptions = { enableNative: true },
  ): Promise<boolean> {
    if (!options.dsn) {
      logger.warn(
        'Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.',
      );
      return false;
    }

    if (!options.enableNative) {
      if (options.enableNativeNagger) {
        logger.warn('Note: Native Sentry SDK is disabled.');
      }
      this.enableNative = false;
      return false;
    }

    return SentryCapacitor.startWithOptions(options);
  },

  /**
   * Fetches the release from native
   */
  async fetchRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }

    return SentryCapacitor.fetchRelease();
  },

  /**
   * Fetches the device contexts. Not used on Android.
   */
  async deviceContexts(): Promise<{ [key: string]: Record<string, unknown> }> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }

    if (this.platform !== 'ios') {
      // Only ios uses deviceContexts, return an empty object.
      return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return SentryCapacitor.deviceContexts();
  },

  /**
   * Sets context on the native scope.
   * @param key string
   * @param context key-value map
   */
  setContext(key: string, context: { [key: string]: unknown } | null): void {
    if (!this.enableNative) {
      return;
    }

    SentryCapacitor.setContext(
      key,
      context !== null ? this._serializeObject(context) : null,
    );
  },

  /**
   * Serializes all values of root-level keys into strings.
   * @param data key-value map.
   * @returns An object where all root-level values are strings.
   */
  _serializeObject(data: {
    [key: string]: unknown;
  }): { [key: string]: string } {
    const serialized: { [key: string]: string } = {};

    Object.keys(data).forEach(dataKey => {
      const value = data[dataKey];
      serialized[dataKey] =
        typeof value === 'string' ? value : JSON.stringify(value);
    });

    return serialized;
  },

  _DisabledNativeError: new SentryError('Native is disabled'),
  enableNative: true,
};
