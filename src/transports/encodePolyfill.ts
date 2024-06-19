import { CAP_GLOBAL_OBJ } from '../utils/webViewUrl';
import { utf8ToBytes } from '../vendor';

export const useEncodePolyfill = (): void => {
  if (!CAP_GLOBAL_OBJ.__SENTRY__) {
    (CAP_GLOBAL_OBJ.__SENTRY__ as Partial<(typeof CAP_GLOBAL_OBJ)['__SENTRY__']>) = {};
  }

  CAP_GLOBAL_OBJ.__SENTRY__.encodePolyfill = encodePolyfill;
};

export const encodePolyfill = (text: string): Uint8Array => {
  const bytes = new Uint8Array(utf8ToBytes(text));
  return bytes;
};
