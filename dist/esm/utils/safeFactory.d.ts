import type { CapacitorOptions } from '../options';
type DangerTypesWithoutCallSignature = Object | null | undefined;
/**
 * Returns callback factory wrapped with try/catch
 * or the original passed value is it's not a function.
 *
 * If the factory fails original data are returned as it.
 * They might be partially modified by the failed function.
 */
export declare function safeFactory<A extends [R, ...unknown[]], R, T extends DangerTypesWithoutCallSignature>(danger: ((...args: A) => R) | T, options?: {
    loggerMessage?: string;
}): ((...args: A) => R) | T;
/**
 * Returns sage tracesSampler that returns 0 if the original failed.
 */
export declare function safeTracesSampler(tracesSampler: CapacitorOptions['tracesSampler']): CapacitorOptions['tracesSampler'];
export {};
//# sourceMappingURL=safeFactory.d.ts.map