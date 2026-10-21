import { debug, GLOBAL_OBJ } from '@sentry/core';
import { markBridgedRequest, unmarkBridgedRequest } from './capacitorHttpBridge';

const PATCHED_KEY = '__sentry_capacitor_xhr_patched__';

type XhrMethod = 'open' | 'send';

const XHR_METHODS: XhrMethod[] = ['open', 'send'];

interface CapacitorWebXMLHttpRequest {
  prototype?: XMLHttpRequest;
}

interface CapacitorXhrGlobal {
  XMLHttpRequest?: typeof XMLHttpRequest & { [PATCHED_KEY]?: boolean };
  CapacitorWebXMLHttpRequest?: CapacitorWebXMLHttpRequest;
}

type CapacitorXhr = XMLHttpRequest & {
  _method?: string;
  _url?: string;
};

/**
 * Marks XHR requests sent through CapacitorHttp, so `capacitorHttpIntegration` doesn't record them twice.
 */
function markXhr(xhr: CapacitorXhr): void {
  const { _method: method, _url: url } = xhr;
  if (typeof method !== 'string' || typeof url !== 'string') {
    return;
  }
  markBridgedRequest('xhr', method, url, xhr);
  xhr.addEventListener('loadend', () => unmarkBridgedRequest(method, url, xhr), { once: true });
}

/**
 * When `CapacitorHttp` is enabled, Capacitor replaces `window.XMLHttpRequest` with a plain function
 * whose `prototype` doesn't contain `open`/`send`, and it reassigns those methods on the original
 * prototype on every construction. That breaks the XHR instrumentation from `@sentry/browser`.
 *
 * This wraps Capacitor's constructor with one that exposes a stable prototype, so the browser SDK can
 * instrument it. The stable prototype delegates `open`/`send` to the current Capacitor implementation.
 */
export function patchCapacitorHttpXhr(): void {
  const global = GLOBAL_OBJ as unknown as CapacitorXhrGlobal;
  const capacitorXhr = global.XMLHttpRequest;
  const originalPrototype = global.CapacitorWebXMLHttpRequest?.prototype;

  if (
    !capacitorXhr ||
    !originalPrototype ||
    capacitorXhr[PATCHED_KEY] ||
    typeof capacitorXhr.prototype?.open === 'function'
  ) {
    return;
  }

  try {
    const stablePrototype = Object.create(originalPrototype) as XMLHttpRequest;
    for (const method of XHR_METHODS) {
      Object.defineProperty(stablePrototype, method, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function (this: CapacitorXhr, ...args: unknown[]): unknown {
          if (method === 'send') {
            markXhr(this);
          }
          // Capacitor reassigns the methods on every construction, so read them at call time.
          return (originalPrototype[method] as (...args: unknown[]) => unknown).apply(this, args);
        },
      });
    }

    const SentryCapacitorXMLHttpRequest = function (): XMLHttpRequest {
      const xhr = new (capacitorXhr as unknown as new () => XMLHttpRequest)();
      Object.setPrototypeOf(xhr, stablePrototype);
      return xhr;
    } as unknown as typeof XMLHttpRequest & { [PATCHED_KEY]?: boolean };

    Object.defineProperty(stablePrototype, 'constructor', {
      configurable: true,
      writable: true,
      value: SentryCapacitorXMLHttpRequest,
    });
    Object.assign(SentryCapacitorXMLHttpRequest, capacitorXhr);
    SentryCapacitorXMLHttpRequest.prototype = stablePrototype;
    SentryCapacitorXMLHttpRequest[PATCHED_KEY] = true;

    global.XMLHttpRequest = SentryCapacitorXMLHttpRequest;
  } catch (e) {
    debug.error('Failed to patch CapacitorHttp XMLHttpRequest', e);
  }
}
