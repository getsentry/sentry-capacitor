import { BrowserOptions } from '@sentry/browser';

/**
 * Configuration options for the Sentry Capacitor SDK.
 */

export interface CapacitorOptions extends BrowserOptions {
  /**
   * Enables crash reporting for native crashes.
   * Defaults to `true`.
   */
  enableNative?: boolean;

  /** Should the native nagger alert be shown or not. */
  enableNativeNagger?: boolean;
}
