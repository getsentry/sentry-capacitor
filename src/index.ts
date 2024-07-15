export * from './definitions';

export type {
  Breadcrumb,
  Request,
  SdkInfo,
  Event,
  Exception,
  SeverityLevel,
  StackFrame,
  Stacktrace,
  Thread,
  User,
} from '@sentry/types';

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

export { replayIntegration, browserTracingIntegration, registerSpanErrorInstrumentation } from '@sentry/browser';

export { SDK_NAME, SDK_VERSION } from './version';
export type { CapacitorOptions } from './options';
export { init, nativeCrash, close } from './sdk';
