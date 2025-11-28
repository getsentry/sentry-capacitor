import type { BrowserOptions, makeFetchTransport } from '@sentry/browser';
import type { ClientOptions } from '@sentry/core';
import type { NuxtOptions, VueOptions } from './siblingOptions';

// Direct reference of BrowserTransportOptions is not compatible with strict builds of latest versions of Typescript 5.
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


  /**
   * Only for Vue or Nuxt Client.
   * Allows the setup of sibling specific SDK. You are still allowed to set the same parameters
   * at the root of Capacitor Options at the cost of lost on JSDocs visibility.
   */
  siblingOptions?: {

    /**
     * Configuration options for the Sentry Vue SDK integration when using Vue.
     * These options are passed to the sibling Vue SDK and control Vue-specific features
     * such as error handling, component tracing, and props attachment.
     */
    vueOptions?: VueOptions;

    /**
     * Configuration options for the Sentry Nuxt SDK integration when using Nuxt.
     * These options are passed to the sibling Nuxt SDK and control Nuxt-specific Vue features
     * such as error handling, component tracing, and props attachment.
     */
    nuxtClientOptions?: NuxtOptions;
  };
}

/**
 * Configuration options for the Sentry Capacitor SDK.
 */
export interface CapacitorOptions
  extends Omit<BrowserOptions, '_experiments'>,
  BaseCapacitorOptions { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CapacitorTransportOptions extends BrowserTransportOptions { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CapacitorClientOptions
  extends ClientOptions<CapacitorTransportOptions>,
  BaseCapacitorOptions { }
