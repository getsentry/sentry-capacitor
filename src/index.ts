export * from './definitions';
export * from './integrations';

export type {
  Breadcrumb,
  RequestEventData,
  SdkInfo,
  Event,
  Exception,
  SeverityLevel,
  StackFrame,
  Stacktrace,
  Thread,
  User,
  Metric
} from '@sentry/core';

export type { Scope } from '@sentry/core';

export {
  addEventProcessor,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
  getClient,
  setContext,
  setExtra,
  setExtras,
  withActiveSpan,
  suppressTracing,
  setTag,
  setTags,
  flush,
  setUser,
  withScope,
  startInactiveSpan,
  startSpan,
  startSpanManual,
  getActiveSpan,
  spanToJSON,
  spanIsSampled,
  setMeasurement,
  getGlobalScope,
  getIsolationScope,
  getCurrentScope,
  setCurrentClient,
  getRootSpan,
  addChildSpanToSpan,
  startIdleSpan,
} from '@sentry/core';

export { metrics, replayIntegration, browserTracingIntegration, registerSpanErrorInstrumentation, logger } from '@sentry/browser';

export { pauseAppHangTracking, resumeAppHangTracking } from './wrapper';

export { SDK_NAME, SDK_VERSION } from './version';
export type { CapacitorOptions } from './options';
export { init, nativeCrash, close } from './sdk';
