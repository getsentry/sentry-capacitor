import { Plugins } from '@capacitor/core';
import { logger, SentryError } from '@sentry/utils';
import { Breadcrumb, Severity, User } from '@sentry/types';

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
   * Sets the user in the native scope.
   * Passing null clears the user.
   * @param key string
   * @param value string
   */
  setUser(user: User | null): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    // separate and serialze all non-default user keys.
    let defaultUserKeys = null;
    let otherUserKeys = null;
    if (user) {
      const { id, ip_address, email, username, ...otherKeys } = user;
      defaultUserKeys = this._serializeObject({
        email,
        id,
        ip_address,
        username,
      });
      otherUserKeys = this._serializeObject(otherKeys);
    }

    SentryCapacitor.setUser(defaultUserKeys, otherUserKeys);
  },

  /**
   * Sets a tag in the native module.
   * @param key string
   * @param value string
   */
  setTag(key: string, value: string): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    const stringifiedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    SentryCapacitor.setTag(key, stringifiedValue);
  },

  /**
   * Sets an extra in the native scope, will stringify
   * extra value if it isn't already a string.
   * @param key string
   * @param extra any
   */
  setExtra(key: string, extra: unknown): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    // we stringify the extra as native only takes in strings.
    const stringifiedExtra =
      typeof extra === 'string' ? extra : JSON.stringify(extra);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    SentryCapacitor.setExtra(key, stringifiedExtra);
  },

  /**
   * Adds breadcrumb to the native scope.
   * @param breadcrumb Breadcrumb
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    SentryCapacitor.addBreadcrumb({
      ...breadcrumb,
      // Process and convert deprecated levels
      level: breadcrumb.level
        ? this._processLevel(breadcrumb.level)
        : undefined,
      data: breadcrumb.data
        ? this._serializeObject(breadcrumb.data)
        : undefined,
    });
  },

  /**
   * Clears breadcrumbs on the native scope.
   */
  clearBreadcrumbs(): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    SentryCapacitor.clearBreadcrumbs();
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
   * Sets log level in native
   * @param level number
   */
  setLogLevel(level: number): void {
    if (!this.enableNative) {
      return;
    }

    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    SentryCapacitor.setLogLevel(level);
  },

  /**
   *  Checks whether the SentryCapacitor module is loaded and the native client is available
   */
  isNativeClientAvailable(): boolean {
    return this.isModuleLoaded() && SentryCapacitor.nativeClientAvailable();
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

  /**
   * Convert js severity level which has critical and log to more widely supported levels.
   * @param level
   * @returns More widely supported Severity level strings
   */
  _processLevel(level: Severity): Severity {
    if (level === Severity.Critical) {
      return Severity.Fatal;
    }
    if (level === Severity.Log) {
      return Severity.Debug;
    }

    return level;
  },

  /**
   * Checks whether the SentryCapacitor module is loaded.
   */
  isModuleLoaded(): boolean {
    return !!SentryCapacitor;
  },

  _DisabledNativeError: new SentryError('Native is disabled'),
  _NativeClientError: new SentryError(
    "Native Client is not available, can't start on native.",
  ),
  enableNative: true,
};
