import { getClient } from '@sentry/core';
import { normalize } from '@sentry/utils';

const KEY = 'value';

/**
 * Converts any input into a valid record with string keys.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToNormalizedObject(data: unknown): Record<string, any> {
  const options = getClient()?.getOptions();
  const normalized: unknown = normalize(data, options?.normalizeDepth, options?.normalizeMaxBreadth);
  if (normalized === null || typeof normalized !== 'object') {
    return {
      [KEY]: normalized,
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return normalized as Record<string, any>;
  }
}
