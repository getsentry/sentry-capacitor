import { Capacitor } from '@capacitor/core';
import { GLOBAL_OBJ } from '@sentry/core';

const PROXY_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
const CAPACITOR_HTTP_INTERCEPTOR = '/_capacitor_http_interceptor_';

// XHR/fetch requests that Capacitor will forward to the CapacitorHttp plugin, keyed by method and url.
const pendingRequests = new Map<string, unknown[]>();

type RequestKind = 'xhr' | 'fetch';

function normalizeUrl(url: string): string {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

function getKey(method: string, url: string): string {
  return `${method.toUpperCase()} ${normalizeUrl(url)}`;
}

/**
 * Capacitor stores the original XHR on native platforms and only replaces it when CapacitorHttp is enabled.
 */
function isCapacitorHttpEnabled(): boolean {
  const global = GLOBAL_OBJ as unknown as {
    XMLHttpRequest?: unknown;
    CapacitorWebXMLHttpRequest?: { fullObject?: unknown };
  };
  const original = global.CapacitorWebXMLHttpRequest?.fullObject;
  return !!original && global.XMLHttpRequest !== original;
}

/**
 * Mirrors the conditions under which Capacitor's patched XHR/fetch send the request through
 * `Capacitor.nativePromise('CapacitorHttp', 'request')` instead of the WebView.
 */
function isBridgedRequest(kind: RequestKind, method: string, url: string): boolean {
  if (!isCapacitorHttpEnabled() || PROXY_METHODS.includes(method.toUpperCase())) {
    return false;
  }
  if (kind === 'xhr') {
    return (url.startsWith('http:') || url.startsWith('https:')) && !url.includes(CAPACITOR_HTTP_INTERCEPTOR);
  }
  // Relative fetch urls resolve to the server url, which Capacitor sends through the WebView.
  const serverUrl = (Capacitor as { getServerUrl?: () => string }).getServerUrl?.();
  return /^[a-z][a-z\d+.-]*:/i.test(url) && (!serverUrl || !url.startsWith(`${serverUrl}/`));
}

/**
 * Marks an XHR/fetch request that Capacitor will send through CapacitorHttp.
 */
export function markBridgedRequest(kind: RequestKind, method: string, url: string, token: unknown): void {
  if (!isBridgedRequest(kind, method, url)) {
    return;
  }
  const key = getKey(method, url);
  const tokens = pendingRequests.get(key) ?? [];
  tokens.push(token);
  pendingRequests.set(key, tokens);
}

/**
 * Removes the mark of a finished request, if it wasn't consumed.
 */
export function unmarkBridgedRequest(method: string, url: string, token: unknown): void {
  const key = getKey(method, url);
  const tokens = pendingRequests.get(key);
  if (!tokens) {
    return;
  }
  const index = tokens.indexOf(token);
  if (index >= 0) {
    tokens.splice(index, 1);
  }
  if (!tokens.length) {
    pendingRequests.delete(key);
  }
}

/**
 * Returns true and consumes the mark if the CapacitorHttp request comes from an XHR/fetch request.
 */
export function consumeBridgedRequest(method: string, url: string): boolean {
  const key = getKey(method, url);
  const tokens = pendingRequests.get(key);
  if (!tokens?.length) {
    return false;
  }
  tokens.shift();
  if (!tokens.length) {
    pendingRequests.delete(key);
  }
  return true;
}
