import { Capacitor } from '@capacitor/core';
import type { BrowserOptions } from '@sentry/browser';
import type { CapacitorOptions } from './options';

interface CapacitorLoggerOptions {
  enableLogs: boolean
}

/**
 * Create a new CapacitorOption without any parameter that could crash the bridge (in short, not being a string, number or boolean).
 * some of the excluded parameters are: Integrations, app, vue, beforeSend, beforeBreadcrumb, integrations, defaultIntegrations, transport, tracesSampler.
 * @param options CapacitorOptions
 */
export function FilterNativeOptions(
  options: CapacitorOptions,
): CapacitorOptions {
  return {
    // allowUrls: Only available on the JavaScript Layer.
    attachStacktrace: options.attachStacktrace,
    attachThreads: options.attachThreads,
    debug: options.debug,
    // denyUrls Only available on the JavaScript Layer.
    dist: options.dist,
    dsn: options.dsn,
    enabled: options.enabled,
    enableNdkScopeSync: options.enableNdkScopeSync,
    enableWatchdogTerminationTracking: options.enableWatchdogTerminationTracking,
    environment: options.environment,
    // ignoreErrors: Only available on the JavaScript Layer.
    // ignoreTransactions: Only available on the JavaScript Layer.
    maxBreadcrumbs: options.maxBreadcrumbs,
    // maxValueLength: Only available on the JavaScript Layer.
    release: options.release,
    // replaysOnErrorSampleRate: Only handled on the JavaScript Layer.
    // replaysSessionSampleRate: Only handled on the JavaScript Layer.
    sampleRate: options.sampleRate,
    sendClientReports: options.sendClientReports,
    sendDefaultPii: options.sendDefaultPii,
    sessionTrackingIntervalMillis: options.sessionTrackingIntervalMillis,
    tracesSampleRate: options.tracesSampleRate,
    // tunnel: options.tunnel: Only handled on the JavaScript Layer.
    enableCaptureFailedRequests: options.enableCaptureFailedRequests,
    ...iOSParameters(options),
    ...LogParameters(options)
  };
}

function iOSParameters(options: CapacitorOptions): CapacitorOptions {
  return Capacitor.getPlatform() === 'ios'
    ? {
      enableAppHangTracking: options.enableAppHangTracking,
      appHangTimeoutInterval: options.appHangTimeoutInterval,
    }
    : {};
}
// Browser options added so options.enableLogs is exposed.
function LogParameters(options: CapacitorOptions & BrowserOptions ): CapacitorLoggerOptions | undefined {
  // eslint-disable-next-line deprecation/deprecation
  const shouldEnable = options.enableLogs as boolean ?? options._experiments?.enableLogs;
  // Only Web and Android implements log parameters initialization.
  if (shouldEnable && Capacitor.getPlatform() === 'android') {
    return { enableLogs: shouldEnable };
  }
  return undefined;
}
