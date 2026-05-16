import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { debug } from '@sentry/core';
import type { NativeLogEntry } from './options';
import { SentryCapacitor } from './plugin';

const NATIVE_LOG_EVENT_NAME = 'SentryNativeLog';

let _removeListener: (() => void) | undefined;

async function registerNativeListener(
  callback: (log: NativeLogEntry) => void,
  setHandle: (listener: PluginListenerHandle) => void,
  isRemoved: () => boolean,
): Promise<void> {
  const listenerHandle = await SentryCapacitor.addListener(NATIVE_LOG_EVENT_NAME, callback);
  if (isRemoved()) {
    await listenerHandle.remove();
  } else {
    setHandle(listenerHandle);
    debug.log('Native log listener set up successfully.');
  }
}

/**
 * Sets up the native log listener that forwards logs from the native SDK to JS.
 * This only works when `debug: true` is set in Sentry options.
 *
 * @param callback - The callback to invoke when a native log is received.
 */
export function setupNativeLogListener(callback: (log: NativeLogEntry) => void): void {
  if (_removeListener) {
    return;
  }

  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') {
    debug.log('Native log listener is only supported on iOS and Android.');
    return;
  }

  let listenerHandle: PluginListenerHandle | undefined;
  let removed = false;

  _removeListener = () => {
    removed = true;
    _removeListener = undefined;
    void listenerHandle?.remove();
  };

  registerNativeListener(
    callback,
    listener => { listenerHandle = listener; },
    () => removed,
  ).catch((error: unknown) => {
    debug.warn('Failed to set up native log listener:', error);
    _removeListener = undefined;
  });
}

/**
 * Removes the native log listener previously set up by `setupNativeLogListener`.
 */
export function stopNativeLogListener(): void {
  _removeListener?.();
}

/**
 * Default handler for native logs that uses Sentry's debug logger.
 * This avoids interference with captureConsoleIntegration which would
 * otherwise capture these logs as breadcrumbs or events.
 */
export function defaultNativeLogHandler(log: NativeLogEntry): void {
  const message = `[Native] [${log.component}] ${log.message}`;

  switch (log.level.toLowerCase()) {
    case 'fatal':
    case 'error':
      debug.error(message);
      break;
    case 'warning':
      debug.warn(message);
      break;
    case 'info':
    case 'debug':
    default:
      debug.log(message);
      break;
  }
}
