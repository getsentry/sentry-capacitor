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

export {
  // eslint-disable-next-line deprecation/deprecation
  addGlobalEventProcessor,
  addEventProcessor,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
  // eslint-disable-next-line deprecation/deprecation
  configureScope,
  getCurrentScope,
  getHubFromCarrier,
  getCurrentHub,
  Hub,
  Scope,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  flush,
  setUser,
  // eslint-disable-next-line deprecation/deprecation
  startTransaction,
  withScope,

  // V8
  startInactiveSpan,
  startSpan,
  startSpanManual,
  getActiveSpan,
  spanToJSON,
  spanIsSampled,
  setMeasurement,
  getGlobalScope,
  // getIsolationScope, TODO: Verify why it's not working
  getClient,
  setCurrentClient,

} from '@sentry/core';
export { Replay, BrowserTracing } from '@sentry/browser'

export { SDK_NAME, SDK_VERSION } from './version';
export type { CapacitorOptions } from './options';
export { init, nativeCrash } from './sdk';
