import { Capacitor } from '@capacitor/core';
import type { CapacitorOptions } from './options';

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
