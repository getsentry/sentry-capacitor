jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getServerUrl: () => 'https://localhost',
  },
}));

import {
  consumeBridgedRequest,
  markBridgedRequest,
  unmarkBridgedRequest,
} from '../../src/utils/capacitorHttpBridge';

type TestGlobal = typeof globalThis & {
  XMLHttpRequest?: unknown;
  CapacitorWebXMLHttpRequest?: unknown;
};

const testGlobal = globalThis as TestGlobal;
const originalXhr = testGlobal.XMLHttpRequest;
const NativeXMLHttpRequest = function NativeXMLHttpRequest() {};

function setCapacitorHttpEnabled(enabled: boolean): void {
  testGlobal.CapacitorWebXMLHttpRequest = { fullObject: NativeXMLHttpRequest };
  testGlobal.XMLHttpRequest = enabled ? function CapacitorXMLHttpRequest() {} : NativeXMLHttpRequest;
}

describe('capacitorHttpBridge', () => {
  beforeEach(() => {
    setCapacitorHttpEnabled(true);
  });

  afterEach(() => {
    testGlobal.XMLHttpRequest = originalXhr;
    delete testGlobal.CapacitorWebXMLHttpRequest;
  });

  test('consumes a marked request once', () => {
    markBridgedRequest('xhr', 'post', 'https://example.com/api', {});

    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(true);
    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(false);
  });

  test('matches normalized urls', () => {
    markBridgedRequest('fetch', 'POST', 'https://example.com', {});

    expect(consumeBridgedRequest('POST', 'https://example.com/')).toBe(true);
  });

  test('tracks concurrent requests to the same url', () => {
    markBridgedRequest('xhr', 'POST', 'https://example.com/api', {});
    markBridgedRequest('xhr', 'POST', 'https://example.com/api', {});

    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(true);
    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(true);
    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(false);
  });

  test('unmarks requests that finished without reaching CapacitorHttp', () => {
    const token = {};
    markBridgedRequest('xhr', 'POST', 'https://example.com/api', token);
    unmarkBridgedRequest('POST', 'https://example.com/api', token);

    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(false);
  });

  test.each([
    ['GET is proxied by the WebView', 'xhr', 'GET', 'https://example.com/api'],
    ['HEAD is proxied by the WebView', 'fetch', 'HEAD', 'https://example.com/api'],
    ['relative XHR urls', 'xhr', 'POST', '/api'],
    ['XHR interceptor urls', 'xhr', 'POST', 'https://localhost/_capacitor_http_interceptor_?u=x'],
    ['relative fetch urls', 'fetch', 'POST', '/api'],
    ['fetch to the server url', 'fetch', 'POST', 'https://localhost/api'],
  ] as const)('does not mark %s', (_name, kind, method, url) => {
    markBridgedRequest(kind, method, url, {});

    expect(consumeBridgedRequest(method, url)).toBe(false);
  });

  test('marks XHR to the server url, which Capacitor sends through CapacitorHttp', () => {
    markBridgedRequest('xhr', 'POST', 'https://localhost/api', {});

    expect(consumeBridgedRequest('POST', 'https://localhost/api')).toBe(true);
  });

  test('does not mark requests when CapacitorHttp is disabled', () => {
    setCapacitorHttpEnabled(false);
    markBridgedRequest('fetch', 'POST', 'https://example.com/api', {});

    expect(consumeBridgedRequest('POST', 'https://example.com/api')).toBe(false);
  });
});
