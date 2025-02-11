import { CAP_GLOBAL_OBJ } from '../utils/webViewUrl';
import { utf8ToBytes } from '../vendor';

export const useEncodePolyfill = (): void => {
  const globalCarriers = CAP_GLOBAL_OBJ.__SENTRY__;

  if (!globalCarriers) {
    (globalCarriers as Partial<
      (typeof CAP_GLOBAL_OBJ)['__SENTRY__']
    >) = {};
  }
  const capacitorSiblingCarrier = globalCarriers?.version && globalCarriers['9.0.0'];


  if (capacitorSiblingCarrier) {
    capacitorSiblingCarrier.encodePolyfill = encodePolyfill;
  }
};

export const encodePolyfill = (text: string): Uint8Array => {
  const bytes = new Uint8Array(utf8ToBytes(text));
  return bytes;
};
