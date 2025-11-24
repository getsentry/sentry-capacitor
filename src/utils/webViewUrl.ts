import type { InternalGlobal } from '@sentry/core';
import { GLOBAL_OBJ } from '@sentry/core';

export interface CapacitorInternalGlobal extends InternalGlobal {
  WEBVIEW_SERVER_URL?: string;
  CAP_SPOTLIGHT_URL?: string;
}

export const CAP_GLOBAL_OBJ = GLOBAL_OBJ as CapacitorInternalGlobal;

/**
 * Return the current webview url if found.
 */
export function getCurrentServerUrl(): string | undefined {
  return CAP_GLOBAL_OBJ.WEBVIEW_SERVER_URL;
}

/**
 * Return the current spotlight url if found.
 */
export function getCurrentSpotlightUrl(): string | undefined {
  return CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
}
