import { getMainCarrier, SDK_VERSION } from '@sentry/core';
<<<<<<< HEAD
import type { CAP_GLOBAL_OBJ } from 'src/utils/webViewUrl';
=======
>>>>>>> d357e12273c76c57f973b4d9a9405b4aa227948a

import { utf8ToBytes } from '../vendor';

export const useEncodePolyfill = (): void => {
<<<<<<< HEAD
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
=======
  // Based on https://github.com/getsentry/sentry-javascript/blob/f0fc41f6166857cd97a695f5cc9a18caf6a0bf43/packages/core/src/carrier.ts#L49
  const carrier = getMainCarrier();
  const __SENTRY__ = (carrier.__SENTRY__ = carrier.__SENTRY__ || {});
  (__SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {}).encodePolyfill = encodePolyfill;
>>>>>>> d357e12273c76c57f973b4d9a9405b4aa227948a
};

export const encodePolyfill = (text: string): Uint8Array => {
  const bytes = new Uint8Array(utf8ToBytes(text));
  return bytes;
};
