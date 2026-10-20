jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getServerUrl: () => 'https://localhost',
  },
}));

import { addXhrInstrumentationHandler, SENTRY_XHR_DATA_KEY } from '@sentry/browser-utils';
import { consumeBridgedRequest } from '../../src/utils/capacitorHttpBridge';
import { patchCapacitorHttpXhr } from '../../src/utils/capacitorHttpXhr';

type TestGlobal = typeof globalThis & {
  XMLHttpRequest?: unknown;
  CapacitorWebXMLHttpRequest?: unknown;
};

const testGlobal = globalThis as TestGlobal;

// Called where Capacitor would forward the request to `Capacitor.nativePromise('CapacitorHttp', 'request')`.
const mockBridgeRequest = jest.fn();

class FakeNativeXMLHttpRequest {
  public _method?: string;
  public _url?: string;
  public readyState = 0;
  public status = 0;
  public calls: string[] = [];
  private _listeners: Array<() => void> = [];

  public open(method: string, url: string): void {
    this.calls.push(`native open ${method} ${url}`);
  }

  public send(): void {
    this.calls.push('native send');
    this.readyState = 4;
    this.status = 200;
    this._listeners.forEach(listener => listener());
  }

  public setRequestHeader(header: string, value: string): void {
    this.calls.push(`native header ${header}=${value}`);
  }

  public addEventListener(_type: string, listener: () => void): void {
    this._listeners.push(listener);
  }

  public removeEventListener(_type: string, listener: () => void): void {
    this._listeners = this._listeners.filter(l => l !== listener);
  }
}

/**
 * Mimics the `XMLHttpRequest` replacement done by Capacitor's native bridge when CapacitorHttp is enabled.
 */
function installCapacitorHttpXhr(): void {
  // A fresh class per test, since Capacitor mutates the native prototype.
  class NativeXMLHttpRequest extends FakeNativeXMLHttpRequest {}
  const original = {
    constructor: NativeXMLHttpRequest.prototype.constructor,
    fullObject: NativeXMLHttpRequest,
    open: NativeXMLHttpRequest.prototype.open,
    prototype: NativeXMLHttpRequest.prototype,
    send: NativeXMLHttpRequest.prototype.send,
  };
  testGlobal.CapacitorWebXMLHttpRequest = original;

  testGlobal.XMLHttpRequest = function () {
    const xhr = new original.constructor();
    const prototype = original.prototype;
    prototype.open = function (this: FakeNativeXMLHttpRequest, method: string, url: string) {
      this.calls.push('capacitor open');
      this._method = method.toUpperCase();
      this._url = url;
      return original.open.call(this, method, url);
    };
    prototype.send = function (this: FakeNativeXMLHttpRequest) {
      this.calls.push('capacitor send');
      if (this._method !== 'GET' && this._url?.startsWith('https:')) {
        mockBridgeRequest(this._method, this._url);
      }
      return original.send.call(this);
    };
    Object.setPrototypeOf(xhr, prototype);
    return xhr;
  };
  Object.assign(testGlobal.XMLHttpRequest as object, original.fullObject);
}

describe('patchCapacitorHttpXhr', () => {
  const originalXhr = testGlobal.XMLHttpRequest;

  afterEach(() => {
    testGlobal.XMLHttpRequest = originalXhr;
    delete testGlobal.CapacitorWebXMLHttpRequest;
  });

  test('does nothing when CapacitorHttp did not replace XMLHttpRequest', () => {
    testGlobal.XMLHttpRequest = FakeNativeXMLHttpRequest;

    patchCapacitorHttpXhr();

    expect(testGlobal.XMLHttpRequest).toBe(FakeNativeXMLHttpRequest);
  });

  test('exposes a prototype with open and send', () => {
    installCapacitorHttpXhr();
    const capacitorXhr = testGlobal.XMLHttpRequest;

    patchCapacitorHttpXhr();

    const patchedXhr = testGlobal.XMLHttpRequest;
    expect(patchedXhr).not.toBe(capacitorXhr);
    expect(typeof patchedXhr.prototype.open).toBe('function');
    expect(typeof patchedXhr.prototype.send).toBe('function');

    const xhr = new patchedXhr();
    expect(xhr).toBeInstanceOf(patchedXhr);
    expect(xhr).toBeInstanceOf(FakeNativeXMLHttpRequest);
  });

  test('is idempotent', () => {
    installCapacitorHttpXhr();

    patchCapacitorHttpXhr();
    const patchedXhr = testGlobal.XMLHttpRequest;
    patchCapacitorHttpXhr();

    expect(testGlobal.XMLHttpRequest).toBe(patchedXhr);
  });

  test('keeps Sentry XHR instrumentation working across multiple requests', () => {
    installCapacitorHttpXhr();
    patchCapacitorHttpXhr();

    const handler = jest.fn();
    expect(() => addXhrInstrumentationHandler(handler)).not.toThrow();

    for (const url of ['https://example.com/first', 'https://example.com/second']) {
      handler.mockClear();
      const xhr = new (testGlobal.XMLHttpRequest as new () => FakeNativeXMLHttpRequest)();
      xhr.open('GET', url);
      xhr.setRequestHeader('sentry-trace', '123');
      xhr.send();

      expect(xhr.calls).toEqual([
        'capacitor open',
        `native open GET ${url}`,
        'native header sentry-trace=123',
        'capacitor send',
        'native send',
      ]);
      expect((xhr as unknown as Record<string, { url: string; request_headers: object }>)[SENTRY_XHR_DATA_KEY]).toEqual(
        expect.objectContaining({ url, request_headers: { 'sentry-trace': '123' } }),
      );
      // Once on send and once on readyState 4.
      expect(handler).toHaveBeenCalledTimes(2);
    }
  });

  test('marks XHR requests sent through CapacitorHttp', () => {
    installCapacitorHttpXhr();
    patchCapacitorHttpXhr();
    const consumed: boolean[] = [];
    mockBridgeRequest.mockImplementation((method: string, url: string) => {
      consumed.push(consumeBridgedRequest(method, url));
    });

    const xhr = new (testGlobal.XMLHttpRequest as new () => FakeNativeXMLHttpRequest)();
    xhr.open('POST', 'https://example.com/api');
    xhr.send();

    expect(consumed).toEqual([true]);
  });

  test('removes the mark when the XHR finishes without reaching CapacitorHttp', () => {
    installCapacitorHttpXhr();
    patchCapacitorHttpXhr();
    mockBridgeRequest.mockImplementation(() => undefined);

    const xhr = new (testGlobal.XMLHttpRequest as new () => FakeNativeXMLHttpRequest)();
    xhr.open('POST', 'https://example.com/unconsumed');
    xhr.send();

    expect(consumeBridgedRequest('POST', 'https://example.com/unconsumed')).toBe(false);
  });

  test('does not mark XHR requests that Capacitor sends through the WebView', () => {
    installCapacitorHttpXhr();
    patchCapacitorHttpXhr();

    const xhr = new (testGlobal.XMLHttpRequest as new () => FakeNativeXMLHttpRequest)();
    xhr.open('GET', 'https://example.com/get');
    // Keep the request in flight, so a mark wouldn't be removed yet.
    jest.spyOn(xhr, 'addEventListener').mockImplementation(() => undefined);
    xhr.send();

    expect(consumeBridgedRequest('GET', 'https://example.com/get')).toBe(false);
  });
});
