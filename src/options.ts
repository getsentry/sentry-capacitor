import { Options } from '@sentry/types';

/**
 * Configuration options for the Sentry Capacitor SDK.
 */

export interface CapacitorOptions extends Options {
  /**
   * Enables crash reporting for native crashes.
   * Defaults to `true`.
   */
  enableNative?: boolean;

  /** Should the native nagger alert be shown or not. */
  enableNativeNagger?: boolean;
}
