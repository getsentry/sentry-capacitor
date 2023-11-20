import { getCurrentServerUrl } from '../../src/utils/webViewUrl';

describe('getCurrentServerUrl', () => {
  test('returns undefined if WEBVIEW_SERVER_URL is undefined', () => {
    expect(getCurrentServerUrl()).toBeUndefined();

  });

  test('returns http://localhost if WEBVIEW_SERVER_URL is ndefined', () => {
    const url = 'http://localhost';

    self = {} as Window & typeof globalThis;
    // @ts-expect-error it's how it's inserted by Capacitor
    self.WEBVIEW_SERVER_URL = url;

    expect(getCurrentServerUrl()).toBe(url);
  });

});
