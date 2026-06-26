import type { BrowserOptions, makeFetchTransport } from '@sentry/browser';
import type { ClientOptions, DataCollection, Metric } from '@sentry/core';
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
   * If set to `true`, the SDK will only continue a trace if the `organization ID` of the incoming trace found in the
   * `baggage` header matches the `organization ID` of the current Sentry client.
   *
   * The client's organization ID is extracted from the DSN or can be set with the `orgId` option.
   *
   * If the organization IDs do not match, the SDK will start a new trace instead of continuing the incoming one.
   * This is useful to prevent traces of unknown third-party services from being continued in your application.
   *
   * @default false
   */
  strictTraceContinuation?: boolean;

  /**
   * The organization ID for your Sentry project.
   *
   * The SDK will try to extract the organization ID from the DSN. If it cannot be found, or if you need to override it,
   * you can provide the ID with this option. The organization ID is used for trace propagation and for features like `strictTraceContinuation`.
   */
  orgId?: `${number}` | number;

  /**
   * If this flag is enabled, certain personally identifiable information (PII) is added by active
   * integrations. By default, no such data is sent.
   *
   * @default false
   */
  sendDefaultPii?: boolean;

  /**
   * Controls what data the SDK collects and sends to Sentry.
   *
   * On the JavaScript layer, all `dataCollection` options are fully supported.
   * On the native mobile layer (iOS/Android), `dataCollection` is not yet supported.
   * Only `dataCollection.userInfo` is bridged to the native SDK as `sendDefaultPii`.
   *
   * @experimental Native SDK support for `dataCollection` is not yet available.
   */
  dataCollection?: DataCollection;

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

  /**
   * A callback that is invoked when the native SDK emits a log message.
   * This is useful for surfacing native SDK logs (e.g., transport errors like HTTP 413)
   * in the JavaScript console.
   *
   * Only works when `debug: true` is set.
   *
   * @example
   * ```typescript
   * Sentry.init({
   *   debug: true,
   *   onNativeLog: ({ level, component, message }) => {
   *     console.log(`[Sentry Native] [${level}] [${component}] ${message}`);
   *   },
   * });
   * ```
   */
  onNativeLog?: (log: NativeLogEntry) => void;

  /**
   * Options which are in beta, or otherwise not guaranteed to be stable.
   */
  _experiments?: {
    /**
     * If metrics support should be enabled.
     *
     * @default false
     * @experimental
     * @platforms web and iOS only. On the future it will be enabled on Android.
     */
    enableMetrics?: boolean;

    /**
     * An event-processing callback for metrics, guaranteed to be invoked after all other metric
     * processors. This allows a metric to be modified or dropped before it's sent.
     *
     * Note that you must return a valid metric from this callback. If you do not wish to modify the metric, simply return
     * it at the end. Returning `null` will cause the metric to be dropped.
     *
     * @default undefined
     * @experimental
     * @platforms web and iOS only. On the future it will be enabled on Android.
     *
     * @param metric The metric generated by the SDK.
     * @returns A new metric that will be sent | null.
     */
    beforeSendMetric?: (metric: Metric) => Metric | null;
  };
}

/**
 * Configuration options for the Sentry Capacitor SDK.
 */
export interface CapacitorOptions
  extends Omit<
      BrowserOptions,
      | '_experiments'
      | 'enableMetrics'
      | 'sendDefaultPii'
      | 'replaysOnErrorSampleRate'
      | 'replaysSessionSampleRate'
      | 'profilesSampleRate'
      | 'profileLifecycle'
      | 'profileSessionSampleRate'
    >,
    BaseCapacitorOptions {}

/**
 * Represents a log entry from the native SDK.
 */
export interface NativeLogEntry {
  level: string;
  component: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CapacitorTransportOptions extends BrowserTransportOptions {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CapacitorClientOptions
  extends Omit<
      ClientOptions<CapacitorTransportOptions>,
      | '_experiments'
      | 'enableMetrics'
      | 'sendDefaultPii'
      | 'replaysOnErrorSampleRate'
      | 'replaysSessionSampleRate'
      | 'profilesSampleRate'
      | 'profileLifecycle'
      | 'profileSessionSampleRate'
    >,
    BaseCapacitorOptions {}
