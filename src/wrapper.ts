/* eslint-disable max-lines */
import { Capacitor } from '@capacitor/core';
import { Breadcrumb, Event, Response, Severity, User } from '@sentry/types';
import { dropUndefinedKeys, logger, SentryError } from '@sentry/utils';

import { CapacitorOptions } from './options';
import { SentryCapacitor } from './plugin';

/**
 * Internal interface for calling native functions
 */
export const NATIVE = {
  /**
   * Sending the event over the bridge to native
   * @param event Event
   */
  async sendEvent(_event: Event): Promise<Response> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    const event = this._processLevels(_event);

    const header = {
      event_id: event.event_id,
      sdk: event.sdk,
    };

    const payload = {
      ...event,
      message: {
        message: event.message,
      },
    };

    const headerString: string = JSON.stringify(header);
    const payloadString: string = JSON.stringify(payload);
    let length = payloadString.length;
    try {
      await SentryCapacitor.getStringBytesLength({ string: payloadString }).then(
        resp => {
          length = resp.value;
        },
      );
    } catch {
      // The native call failed, we do nothing, we have payload.length as a fallback
    }

    const item = {
      content_type: 'application/json',
      length,
      type: payload.type ?? 'event',
    };

    const itemString = JSON.stringify(item);

    const envelopeString = `${headerString}\n${itemString}\n${payloadString}`;
    return SentryCapacitor.captureEnvelope({ envelope: envelopeString });
  },

  /**
   * Starts native with the provided options
   * @param options CapacitorOptions
   */
  async initNativeSdk(options: CapacitorOptions): Promise<boolean> {
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

    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    // filter out all options that would crash native
    /* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars */
    const {
      beforeSend,
      beforeBreadcrumb,
      integrations,
      defaultIntegrations,
      transport,
      ...filteredOptions
    } = options;

    return SentryCapacitor.initNativeSdk({ options: filteredOptions });
  },

  /**
   * Fetches the release from native
   */
  async fetchNativeRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }

    return SentryCapacitor.fetchNativeRelease();
  },

  async fetchNativeSdkInfo(): Promise<{
    name: string;
    version: string;
  }> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }

    return SentryCapacitor.fetchNativeSdkInfo();
  },

  /**
   * Triggers a native crash.
   * Use this only for testing purposes.
   */
  crash(): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }
    SentryCapacitor.crash();
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
      defaultUserKeys = dropUndefinedKeys(
        this._serializeObject({
          email,
          id,
          ip_address,
          username,
        }),
      );
      otherUserKeys = dropUndefinedKeys(this._serializeObject(otherKeys));
    }

    SentryCapacitor.setUser({ defaultUserKeys, otherUserKeys });
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

    SentryCapacitor.setTag({ key, value: stringifiedValue });
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
    const stringifiedValue =
      typeof extra === 'string' ? extra : JSON.stringify(extra);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    SentryCapacitor.setExtra({ key, value: stringifiedValue });
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
   * Sets context on the native scope. Not implemented in Android yet.
   * @param key string
   * @param context key-value map
   */
  setContext(key: string, context: { [key: string]: unknown } | null): void {
    if (!this.enableNative) {
      return;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    if (this.platform === 'android') {
      // setContext not available on the Android SDK yet.
      this.setExtra(key, context);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      SentryCapacitor.setContext({
        key,
        value: context !== null ? this._serializeObject(context) : null,
      });
    }
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
   * Convert js severity level in event.level and event.breadcrumbs to more widely supported levels.
   * @param event
   * @returns Event with more widely supported Severity level strings
   */
  _processLevels(event: Event): Event {
    const processed: Event = {
      ...event,
      level: event.level ? this._processLevel(event.level) : undefined,
      breadcrumbs: event.breadcrumbs?.map(breadcrumb => ({
        ...breadcrumb,
        level: breadcrumb.level
          ? this._processLevel(breadcrumb.level)
          : undefined,
      })),
    };

    return processed;
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

  /**
   *  Checks whether the SentryCapacitor module is loaded and the native client is available
   */
  isNativeClientAvailable(): boolean {
    return (
      this.isModuleLoaded() && Capacitor.isPluginAvailable('SentryCapacitor')
    );
  },

  _DisabledNativeError: new SentryError('Native is disabled'),
  _NativeClientError: new SentryError(
    "Native Client is not available, can't start on native.",
  ),
  enableNative: true,
  platform: Capacitor.getPlatform(),
};
