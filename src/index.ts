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
  setUser,
  // eslint-disable-next-line deprecation/deprecation
  startTransaction,
  startSpan,
  startSpanManual,
  startInactiveSpan,
  withScope,
} from '@sentry/core';
export { Replay, BrowserTracing } from '@sentry/browser'

export { SDK_NAME, SDK_VERSION } from './version';
export type { CapacitorOptions } from './options';
export { init, nativeCrash } from './sdk';
