/**
 * Create a new CapacitorOption without any parameter that could crash the bridge (in short, not being a string, number or boolean).
 * some of the excluded parameters are: Integrations, app, vue, beforeSend, beforeBreadcrumb, integrations, defaultIntegrations, transport, tracesSampler.
 * @param options CapacitorOptions
 */
export function FilterNativeOptions(options) {
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
        enableOutOfMemoryTracking: options.enableOutOfMemoryTracking,
        enableTracing: options.enableTracing,
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
    };
}
//# sourceMappingURL=nativeOptions.js.map