import { Capacitor } from '@capacitor/core';
import type { BaseEnvelopeItemHeaders, Breadcrumb, Envelope, EnvelopeItem, Event, SeverityLevel, User } from '@sentry/types';
import { dropUndefinedKeys, logger, SentryError } from '@sentry/utils';

import type { NativeDeviceContextsResponse } from './definitions';
import type { CapacitorOptions } from './options';
import { SentryCapacitor } from './plugin';
import { utf8ToBytes } from './vendor';

/**
 * Internal interface for calling native functions
 */
export const NATIVE = {
  /**
   * Sending the event over the bridge to native
   * @param event Event
   */
  async sendEnvelope(envelope: Envelope): Promise<void> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    const [EOL] = utf8ToBytes('\n');
    const [envelopeHeader, envelopeItems] = envelope;

    const headerString = JSON.stringify(envelopeHeader);
    let envelopeBytes: number[] = utf8ToBytes(headerString);
    envelopeBytes.push(EOL);

    for (const rawItem of envelopeItems) {

      const [itemHeader, itemPayload] = this._processItem(rawItem);

      let bytesContentType: string;
      let bytesPayload: number[] = [];
        if (typeof itemPayload === 'string') {
        bytesContentType = 'text/plain';
        bytesPayload = utf8ToBytes(itemPayload);
      } else if (itemPayload instanceof Uint8Array) {
        bytesContentType = typeof itemHeader.content_type === 'string'
          ? itemHeader.content_type
          : 'application/octet-stream';
        bytesPayload = [...itemPayload];
      } else {
        bytesContentType = 'application/json';
        bytesPayload = utf8ToBytes(JSON.stringify(itemPayload));
      }

      // Content type is not inside BaseEnvelopeItemHeaders.
      (itemHeader as BaseEnvelopeItemHeaders).content_type = bytesContentType;
      (itemHeader as BaseEnvelopeItemHeaders).length = bytesPayload.length;
      const serializedItemHeader = JSON.stringify(itemHeader);

      envelopeBytes.push(...utf8ToBytes(serializedItemHeader));
      envelopeBytes.push(EOL);
      envelopeBytes = envelopeBytes.concat(bytesPayload);
      envelopeBytes.push(EOL);
    }
    await SentryCapacitor.captureEnvelope({ envelope: envelopeBytes });
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
      // @ts-ignore Vue specific option.
      app,
      // @ts-ignore Vue specific option.
      vue,
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
   * Fetches the device contexts. Not used on Android.
   */
  async fetchNativeDeviceContexts(): Promise<NativeDeviceContextsResponse> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    if (this.platform !== 'ios') {
      // Only ios uses deviceContexts, return an empty object.
      return {};
    }

    return SentryCapacitor.fetchNativeDeviceContexts();
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
   * Gets the event from envelopeItem and applies the level filter to the selected event.
   * @param data An envelope item containing the event.
   * @returns The event from envelopeItem or undefined.
   */
  _processItem(item: EnvelopeItem): EnvelopeItem {
    if (NATIVE.platform === 'android') {
      const [itemHeader, itemPayload] = item;

      if (itemHeader.type == 'event' || itemHeader.type == 'transaction') {
        const event = this._processLevels(itemPayload as Event);
        if ('message' in event) {
          // @ts-ignore Android still uses the old message object, without this the serialization of events will break.
          event.message = { message: event.message };
        }
        /*
      We do this to avoid duplicate breadcrumbs on Android as sentry-android applies the breadcrumbs
      from the native scope onto every envelope sent through it. This scope will contain the breadcrumbs
      sent through the scope sync feature. This causes duplicate breadcrumbs.
      We then remove the breadcrumbs in all cases but if it is handled == false,
      this is a signal that the app would crash and android would lose the breadcrumbs by the time the app is restarted to read
      the envelope.
      Since unhandled errors from Javascript are not going to crash the App, we can't rely on the
      handled flag for filtering breadcrumbs.
        */
        if (event.breadcrumbs) {
          event.breadcrumbs = [];
        }
        return [itemHeader, event];
      }
    }

    return item;
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

  _processLevel(level: SeverityLevel): SeverityLevel {
    if (level == 'log' as SeverityLevel) {
      return 'debug' as SeverityLevel;
    }
    else if (level == 'critical' as SeverityLevel) {
      return 'fatal' as SeverityLevel;
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
