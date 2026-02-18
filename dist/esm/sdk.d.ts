import type { BrowserOptions } from '@sentry/browser';
import type { CapacitorOptions } from './options';
/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export declare function init<T>(passedOptions: CapacitorOptions & T, originalInit?: (passedOptions: T & BrowserOptions) => void): void;
/**
 * Closes the SDK, stops sending events.
 */
export declare function close(): Promise<void>;
/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export declare function nativeCrash(): void;
//# sourceMappingURL=sdk.d.ts.map