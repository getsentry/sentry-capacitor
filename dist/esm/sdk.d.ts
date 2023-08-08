import type { CapacitorOptions } from './options';
/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export declare function init<O>(passedOptions: CapacitorOptions & O, originalInit?: (passedOptions: O) => void): void;
/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export declare function nativeCrash(): void;
//# sourceMappingURL=sdk.d.ts.map