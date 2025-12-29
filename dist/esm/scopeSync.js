import { DEFAULT_BREADCRUMB_LEVEL } from './breadcrumb';
import { fillTyped } from './utils/fill';
import { convertToNormalizedObject } from './utils/normalize';
import { NATIVE } from './wrapper';
/**
 * This WeakMap is used to keep track of which scopes have been synced to the native SDKs.
 * This ensures that we don't double sync the same scope.
 */
const syncedToNativeMap = new WeakMap();
/**
 * Hooks into the scope set methods and sync new data added to the given scope with the native SDKs.
 */
export function enableSyncToNative(scope) {
    if (syncedToNativeMap.has(scope)) {
        return;
    }
    syncedToNativeMap.set(scope, true);
    fillTyped(scope, 'setUser', original => (user) => {
        NATIVE.setUser(user);
        return original.call(scope, user);
    });
    fillTyped(scope, 'setTag', original => (key, value) => {
        NATIVE.setTag(key, value);
        return original.call(scope, key, value);
    });
    fillTyped(scope, 'setTags', original => (tags) => {
        // As native only has setTag, we just loop through each tag key.
        Object.keys(tags).forEach(key => {
            NATIVE.setTag(key, tags[key]);
        });
        return original.call(scope, tags);
    });
    fillTyped(scope, 'setExtras', original => (extras) => {
        Object.keys(extras).forEach(key => {
            NATIVE.setExtra(key, extras[key]);
        });
        return original.call(scope, extras);
    });
    fillTyped(scope, 'setExtra', original => (key, value) => {
        NATIVE.setExtra(key, value);
        return original.call(scope, key, value);
    });
    fillTyped(scope, 'addBreadcrumb', original => (breadcrumb, maxBreadcrumbs) => {
        const mergedBreadcrumb = {
            ...breadcrumb,
            level: breadcrumb.level || DEFAULT_BREADCRUMB_LEVEL,
            data: breadcrumb.data ? convertToNormalizedObject(breadcrumb.data) : undefined,
        };
        original.call(scope, mergedBreadcrumb, maxBreadcrumbs);
        const finalBreadcrumb = scope.getLastBreadcrumb();
        if (finalBreadcrumb) {
            NATIVE.addBreadcrumb(finalBreadcrumb);
        }
        return scope;
    });
    fillTyped(scope, 'clearBreadcrumbs', original => () => {
        NATIVE.clearBreadcrumbs();
        return original.call(scope);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fillTyped(scope, 'setContext', original => (key, context) => {
        NATIVE.setContext(key, context);
        return original.call(scope, key, context);
    });
}
//# sourceMappingURL=scopeSync.js.map