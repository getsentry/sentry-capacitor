import type { BrowserOptions, makeFetchTransport } from '@sentry/browser';
import type { ClientOptions } from '@sentry/core';
type BrowserTransportOptions = Parameters<typeof makeFetchTransport>[0];
export interface BaseCapacitorOptions {
    /**
     * Enables crash reporting for native crashes.
     * Defaults to `true`.
     */
    enableNative?: boolean;
    /**
     * Enables native crashHandling. This only works if `enableNative` is `true`.
     * Defaults to `true`.
     */
    enableNativeCrashHandling?: boolean;
    /** Maximum time to wait to drain the request queue, before the process is allowed to exit. */
    shutdownTimeout?: number;
    /** Should the native nagger alert be shown or not. */
    enableNativeNagger?: boolean;
    /** Should sessions be tracked to Sentry Health or not. */
    enableAutoSessionTracking?: boolean;
    /** The interval to end a session if the App goes to the background. */
    sessionTrackingIntervalMillis?: number;
    /** Enable scope sync from Java to NDK on Android */
    enableNdkScopeSync?: boolean;
    /** When enabled, all the threads are automatically attached to all logged events on Android */
    attachThreads?: boolean;
    /**
     * Enables Out of Memory Tracking for iOS and macCatalyst.
     * See the following link for more information and possible restrictions:
     * https://docs.sentry.io/platforms/apple/guides/ios/configuration/watchdog-terminations/
     *
     * @default true
     * */
    enableWatchdogTerminationTracking?: boolean;
    /**
     * When enabled, Sentry will capture failed XHR/Fetch requests. This option also enabled HTTP Errors on iOS.
     *
     * @default false
     */
    enableCaptureFailedRequests?: boolean;
    /**
     * When enabled, the SDK tracks when the application stops responding for a specific amount of
     * time defined by the `appHangTimeoutInterval` option.
     *
     * iOS only
     *
     * @default true
     */
    enableAppHangTracking?: boolean;
    /**
     * The minimum amount of time an app should be unresponsive to be classified as an App Hanging.
     * The actual amount may be a little longer.
     * Avoid using values lower than 100ms, which may cause a lot of app hangs events being transmitted.
     * Value should be in seconds.
     *
     * iOS only
     *
     * @default 2
     */
    appHangTimeoutInterval?: number;
}
/**
 * Configuration options for the Sentry Capacitor SDK.
 */
export interface CapacitorOptions extends Omit<BrowserOptions, 'autoSessionTracking' | 'enableLogs'>, BaseCapacitorOptions {
}
export interface CapacitorTransportOptions extends BrowserTransportOptions {
}
export interface CapacitorClientOptions extends ClientOptions<CapacitorTransportOptions>, BaseCapacitorOptions {
}
export {};
//# sourceMappingURL=options.d.ts.map