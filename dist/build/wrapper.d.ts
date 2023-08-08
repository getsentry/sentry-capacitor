import type { Breadcrumb, Envelope, EnvelopeItem, Event, SeverityLevel, TransportMakeRequestResponse, User } from '@sentry/types';
import { SentryError } from '@sentry/utils';
import type { NativeDeviceContextsResponse } from './definitions';
import type { CapacitorOptions } from './options';
/**
 * Internal interface for calling native functions
 */
export declare const NATIVE: {
    /**
     * Sending the event over the bridge to native
     * @param event Event
     */
    sendEnvelope(envelope: Envelope): Promise<TransportMakeRequestResponse | void>;
    /**
     * Starts native with the provided options
     * @param options CapacitorOptions
     */
    initNativeSdk(options: CapacitorOptions): Promise<boolean>;
    /**
     * Fetches the device contexts. Not used on Android.
     */
    fetchNativeDeviceContexts(): Promise<NativeDeviceContextsResponse>;
    /**
     * Fetches the release from native
     */
    fetchNativeRelease(): Promise<{
        build: string;
        id: string;
        version: string;
    }>;
    fetchNativeSdkInfo(): Promise<{
        name: string;
        version: string;
    }>;
    /**
     * Triggers a native crash.
     * Use this only for testing purposes.
     */
    crash(): void;
    /**
     * Sets the user in the native scope.
     * Passing null clears the user.
     * @param key string
     * @param value string
     */
    setUser(user: User | null): void;
    /**
     * Sets a tag in the native module.
     * @param key string
     * @param value string
     */
    setTag(key: string, value: string): void;
    /**
     * Sets an extra in the native scope, will stringify
     * extra value if it isn't already a string.
     * @param key string
     * @param extra any
     */
    setExtra(key: string, extra: unknown): void;
    /**
     * Adds breadcrumb to the native scope.
     * @param breadcrumb Breadcrumb
     */
    addBreadcrumb(breadcrumb: Breadcrumb): void;
    /**
     * Clears breadcrumbs on the native scope.
     */
    clearBreadcrumbs(): void;
    /**
     * Sets context on the native scope. Not implemented in Android yet.
     * @param key string
     * @param context key-value map
     */
    setContext(key: string, context: {
        [key: string]: unknown;
    } | null): void;
    /**
     * Gets the event from envelopeItem and applies the level filter to the selected event.
     * @param data An envelope item containing the event.
     * @returns The event from envelopeItem or undefined.
     */
    _processItem(item: EnvelopeItem): EnvelopeItem;
    /**
     * Serializes all values of root-level keys into strings.
     * @param data key-value map.
     * @returns An object where all root-level values are strings.
     */
    _serializeObject(data: {
        [key: string]: unknown;
    }): {
        [key: string]: string;
    };
    /**
     * Convert js severity level in event.level and event.breadcrumbs to more widely supported levels.
     * @param event
     * @returns Event with more widely supported Severity level strings
     */
    _processLevels(event: Event): Event;
    /**
     * Convert js severity level which has critical and log to more widely supported levels.
     * @param level
     * @returns More widely supported Severity level strings
     */
    _processLevel(level: SeverityLevel): SeverityLevel;
    /**
     * Checks whether the SentryCapacitor module is loaded.
     */
    isModuleLoaded(): boolean;
    /**
     *  Checks whether the SentryCapacitor module is loaded and the native client is available
     */
    isNativeClientAvailable(): boolean;
    _DisabledNativeError: SentryError;
    _NativeClientError: SentryError;
    enableNative: boolean;
    platform: string;
};
//# sourceMappingURL=wrapper.d.ts.map