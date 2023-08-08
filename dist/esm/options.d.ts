import type { BrowserOptions } from '@sentry/browser';
/**
 * Configuration options for the Sentry Capacitor SDK.
 */
export interface CapacitorOptions extends Omit<BrowserOptions, 'autoSessionTracking'> {
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
    * https://docs.sentry.io/platforms/apple/guides/ios/configuration/out-of-memory/
    *
    * @default true
    * */
    enableOutOfMemoryTracking?: boolean;
}
//# sourceMappingURL=options.d.ts.map