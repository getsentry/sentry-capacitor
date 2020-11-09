import { logger } from '@sentry/utils';
import { Plugins } from '@capacitor/core';

import { CapacitorOptions } from './options';

const { SentryCapacitor } = Plugins;

/**
 * Internal interface for calling native functions
 */
export const NATIVE = {
  /**
   * Starts native with the provided options
   * @param options CapacitorOptions
   */
  async startWithOptions(
    options: CapacitorOptions = { enableNative: true },
  ): Promise<boolean> {
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

    return SentryCapacitor.startWithOptions(options);
  },
};
