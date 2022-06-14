/* eslint-disable max-lines */
import { Capacitor } from '@capacitor/core';
import { AttachmentItem, BaseEnvelopeItemHeaders, Breadcrumb, ClientReportItem, Envelope, Event, EventItem, SessionItem, SeverityLevel, User, UserFeedbackItem } from '@sentry/types';
import { dropUndefinedKeys, logger, SentryError } from '@sentry/utils';

import { NativeDeviceContextsResponse } from './definitions';
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
  async sendEnvelope(envelope: Envelope): Promise<void> {
    if (!this.enableNative) {
      throw this._DisabledNativeError;
    }
    if (!this.isNativeClientAvailable()) {
      throw this._NativeClientError;
    }

    const header = envelope[0];

    if (NATIVE.platform === 'android') {
      const headerString = JSON.stringify(header);

      let envelopeItemsBuilder = `${headerString}`;

      for (const envelopeItems of envelope[1]) {

        const event = this._getEvent(envelopeItems);
        if (event != undefined) {

          // @ts-ignore Android still uses the old message object, without this the serialization of events will break.
          event.message = { message: event.message };

          /*
        We do this to avoid duplicate breadcrumbs on Android as sentry-android applies the breadcrumbs
        from the native scope onto every envelope sent through it. This scope will contain the breadcrumbs
        sent through the scope sync feature. This causes duplicate breadcrumbs.
        We then remove the breadcrumbs in all cases but if it is handled == false,
        this is a signal that the app would crash and android would lose the breadcrumbs by the time the app is restarted to read
        the envelope.
          */
          if (event.exception?.values?.[0]?.mechanism?.handled != false && event.breadcrumbs) {
            event.breadcrumbs = [];
          }
          envelopeItems[1] = event;
        }

        // Content type is not inside BaseEnvelopeItemHeaders.
        (envelopeItems[0] as BaseEnvelopeItemHeaders).content_type = 'application/json';

        const itemPayload = JSON.stringify(envelopeItems[1]);

        let length = itemPayload.length;
        try {
          await SentryCapacitor.getStringBytesLength({ string: itemPayload }).then(
            resp => {
              length = resp.value;
            })
        } catch {
          // The native call failed, we do nothing, we have payload.length as a fallback
        }

        (envelopeItems[0] as BaseEnvelopeItemHeaders).length = length;
        const itemHeader = JSON.stringify(envelopeItems[0]);

        envelopeItemsBuilder += `\n${itemHeader}\n${itemPayload}`;
      }
      await SentryCapacitor.captureEnvelope({ envelope: envelopeItemsBuilder });

    }
    else {
      // iOS/Mac

      for (const envelopeItems of envelope[1]) {
        const event = this._getEvent(envelopeItems);
        if (event != undefined) {
          envelopeItems[1] = event;
        }

        const itemPayload = JSON.parse(JSON.stringify(envelopeItems[1]));

        // The envelope item is created (and its length determined) on the iOS side of the native bridge.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await SentryCapacitor.captureEnvelope({
        envelope: {
        header: header,
        payload: itemPayload,
        }
      });

      }
    }
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
     _getEvent(envelopeItem: EventItem | AttachmentItem | UserFeedbackItem | SessionItem | ClientReportItem): Event | undefined {
      if (envelopeItem[0].type == 'event' || envelopeItem[0].type == 'transaction') {
        return this._processLevels(envelopeItem[1] as Event);
      }
      return undefined;
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
