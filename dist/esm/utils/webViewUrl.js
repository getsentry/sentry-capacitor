import { GLOBAL_OBJ } from '@sentry/core';
export const CAP_GLOBAL_OBJ = GLOBAL_OBJ;
/**
 * Return the current webview url if found.
 */
export function getCurrentServerUrl() {
    return CAP_GLOBAL_OBJ.WEBVIEW_SERVER_URL;
}
//# sourceMappingURL=webViewUrl.js.map