import type { InternalGlobal } from '@sentry/core';
export interface CapacitorInternalGlobal extends InternalGlobal {
    WEBVIEW_SERVER_URL?: string;
}
export declare const CAP_GLOBAL_OBJ: CapacitorInternalGlobal;
/**
 * Return the current webview url if found.
 */
export declare function getCurrentServerUrl(): string | undefined;
//# sourceMappingURL=webViewUrl.d.ts.map