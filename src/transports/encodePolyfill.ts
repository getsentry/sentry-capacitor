import { getMainCarrier, SDK_VERSION } from '@sentry/core';
import type { CAP_GLOBAL_OBJ } from 'src/utils/webViewUrl';

import { utf8ToBytes } from '../vendor';

export const useEncodePolyfill = (): void => {
  const globalCarriers = getMainCarrier().__SENTRY__;
  if (!globalCarriers) {
    (globalCarriers as Partial<
      (typeof CAP_GLOBAL_OBJ)['__SENTRY__']
    >) = {};
  }
  const capacitorSiblingCarrier = globalCarriers?.[SDK_VERSION];

  if (capacitorSiblingCarrier) {
    capacitorSiblingCarrier.encodePolyfill = encodePolyfill;
  }
};

export const encodePolyfill = (text: string): Uint8Array => {
  const bytes = new Uint8Array(utf8ToBytes(text));
  return bytes;
};
