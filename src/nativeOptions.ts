import { Capacitor } from '@capacitor/core';
import type { CapacitorOptions } from './options';
import { getCurrentSpotlightUrl } from './utils/webViewUrl';

interface CapacitorLoggerOptions {
  enableLogs: boolean
}

interface CapacitorSpotlightOptions {
  sidecarUrl: string;
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
    ...LogParameters(options),
    ...SpotlightParameters(),
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
function LogParameters(options: CapacitorOptions  & { enableLogs?: boolean }): CapacitorLoggerOptions | undefined {
  // Only Web and Android implements log parameters initialization.
  if (options.enableLogs && Capacitor.getPlatform() === 'android') {
    return { enableLogs: true };
  }
  return undefined;
}

function SpotlightParameters(): CapacitorSpotlightOptions | undefined {
  const spotlightUrl = getCurrentSpotlightUrl();
  if (spotlightUrl) {
    return { sidecarUrl: spotlightUrl };
  }
  return undefined;
}
