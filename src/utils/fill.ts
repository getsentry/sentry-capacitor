import { fill, getOriginalFunction } from '@sentry/core';

/**
 * The same as `import { fill } from '@sentry/core';` but with explicit types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fillTyped<Source extends { [key: string]: any }, Name extends keyof Source & string>(
  source: Source,
  name: Name,
  replacement: (original: Source[Name]) => Source[Name],
): void {
  fill(source, name, replacement);
}

/**
 * Restores the original function that was previously replaced by a fill operation.
 * This undoes the effect of `fillTyped` by retrieving and restoring the original function.
 *
 * @param source - The object containing the function to restore
 * @param name - The property name of the function to restore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restorefillTyped<Source extends { [key: string]: any }, Name extends keyof Source & string>(
  source: Source,
  name: Name): void {
  const original = getOriginalFunction(source[name]) as Source[Name];
  source[name] = original;
}
