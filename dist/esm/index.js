export * from './definitions';
export { addEventProcessor, addBreadcrumb, captureException, captureEvent, captureMessage, getClient, setContext, setExtra, setExtras, withActiveSpan, suppressTracing, setTag, setTags, flush, setUser, withScope, startInactiveSpan, startSpan, startSpanManual, getActiveSpan, spanToJSON, spanIsSampled, setMeasurement, getGlobalScope, getIsolationScope, getCurrentScope, setCurrentClient, getRootSpan, addChildSpanToSpan, startIdleSpan, } from '@sentry/core';
export { replayIntegration, browserTracingIntegration, registerSpanErrorInstrumentation, logger } from '@sentry/browser';
export { pauseAppHangTracking, resumeAppHangTracking } from './wrapper';
export { SDK_NAME, SDK_VERSION } from './version';
export { init, nativeCrash, close } from './sdk';
//# sourceMappingURL=index.js.map