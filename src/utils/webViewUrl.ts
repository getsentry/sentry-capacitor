import type { InternalGlobal } from '@sentry/utils';
import { GLOBAL_OBJ } from '@sentry/utils';

export interface CapacitorInternalGlobal extends InternalGlobal {
  WEBVIEW_SERVER_URL?: string;
}

export const CAP_GLOBAL_OBJ = GLOBAL_OBJ as CapacitorInternalGlobal;

/**
 * Return the current webview url if found.
 */
export function getCurrentServerUrl(): string | undefined {
  return CAP_GLOBAL_OBJ.WEBVIEW_SERVER_URL;
}
