import { debug } from '@sentry/core';
/**
 * Returns callback factory wrapped with try/catch
 * or the original passed value is it's not a function.
 *
 * If the factory fails original data are returned as it.
 * They might be partially modified by the failed function.
 */
export function safeFactory(danger, options = {}) {
    if (typeof danger === 'function') {
        return (...args) => {
            try {
                return danger(...args);
            }
            catch (error) {
                debug.error(options.loggerMessage
                    ? options.loggerMessage
                    : `The ${danger.name} callback threw an error`, error);
                return args[0];
            }
        };
    }
    else {
        return danger;
    }
}
/**
 * Returns sage tracesSampler that returns 0 if the original failed.
 */
export function safeTracesSampler(tracesSampler) {
    if (tracesSampler) {
        return (...args) => {
            try {
                return tracesSampler(...args);
            }
            catch (error) {
                debug.error('The tracesSampler callback threw an error', error);
                return 0;
            }
        };
    }
    else {
        return tracesSampler;
    }
}
//# sourceMappingURL=safeFactory.js.map