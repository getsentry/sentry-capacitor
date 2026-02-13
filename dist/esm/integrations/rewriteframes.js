import { rewriteFramesIntegration as originalRewriteFramesIntegration, } from '@sentry/core';
import { getCurrentServerUrl } from '../utils/webViewUrl';
/**
 * Create Capacitor default rewrite frames integration
 * which appends app:// to the beginning of the filename
 * and removes the local server url prefixes.
 */
export const capacitorRewriteFramesIntegration = () => {
    return originalRewriteFramesIntegration({
        iteratee: rewriteFramesIteratee,
    });
};
/**
 * Rewrites the filename of a stack frame for better readability.
 * - Removes server URL or localhost prefix.
 * - Adjusts for native code frames.
 * - Adds 'app://' prefix for non-http(s) frames.
 * - Sets 'in_app' flag to true for app frames, false for native frames.
 */
function rewriteFramesIteratee(frame) {
    if (frame.filename) {
        const isReachableHost = /^https?:\/\//.test(frame.filename);
        const serverUrl = getCurrentServerUrl();
        if (serverUrl) {
            frame.filename = frame.filename.replace(serverUrl, '');
        }
        else {
            frame.filename = frame.filename
                .replace(/^https?:\/\/localhost(:\d+)?/, '')
                .replace(/^capacitor:\/\/localhost(:\d+)?/, '');
        }
        frame.filename = frame.filename.replace(/^ng:\/\//, '');
        const isNativeFrame = frame.filename === '[native code]' || frame.filename === 'native';
        if (!isNativeFrame) {
            // We don't need to use `app://` protocol for http(s) based hosts
            if (!isReachableHost) {
                // We always want to have a triple slash
                const filename = frame.filename.startsWith('/')
                    ? frame.filename
                    : `/${frame.filename}`;
                const appPrefix = 'app://';
                frame.filename = `${appPrefix}${filename}`;
            }
            frame.in_app = true;
        }
        else {
            frame.in_app = false;
        }
    }
    return frame;
}
//# sourceMappingURL=rewriteframes.js.map