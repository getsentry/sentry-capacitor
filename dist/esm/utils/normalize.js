import { getClient, normalize } from '@sentry/core';
const KEY = 'value';
/**
 * Converts any input into a valid record with string keys.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToNormalizedObject(data) {
    var _a;
    const options = (_a = getClient()) === null || _a === void 0 ? void 0 : _a.getOptions();
    const normalized = normalize(data, options === null || options === void 0 ? void 0 : options.normalizeDepth, options === null || options === void 0 ? void 0 : options.normalizeMaxBreadth);
    if (normalized === null || typeof normalized !== 'object') {
        return {
            [KEY]: normalized,
        };
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return normalized;
    }
}
//# sourceMappingURL=normalize.js.map