import { Scope } from '@sentry/core';
import { NATIVE } from './wrapper';
/**
 * Extends the scope methods to set scope on the Native SDKs
 */
export class CapacitorScope extends Scope {
    /**
     * @inheritDoc
     */
    setUser(user) {
        NATIVE.setUser(user);
        return super.setUser(user);
    }
    /**
     * @inheritDoc
     */
    setTag(key, value) {
        /* eslint-disable no-console */
        NATIVE.setTag(key, value);
        return super.setTag(key, value);
    }
    /**
     * @inheritDoc
     */
    setTags(tags) {
        /* eslint-disable no-console */
        // As native only has setTag, we just loop through each tag key.
        Object.keys(tags).forEach(key => {
            NATIVE.setTag(key, tags[key]);
        });
        return super.setTags(tags);
    }
    /**
     * @inheritDoc
     */
    setExtras(extras) {
        Object.keys(extras).forEach(key => {
            NATIVE.setExtra(key, extras[key]);
        });
        return super.setExtras(extras);
    }
    /**
     * @inheritDoc
     */
    setExtra(key, extra) {
        NATIVE.setExtra(key, extra);
        return super.setExtra(key, extra);
    }
    /**
     * @inheritDoc
     */
    setContext(key, context) {
        NATIVE.setContext(key, context);
        return super.setContext(key, context);
    }
    /**
     * @inheritDoc
     */
    addBreadcrumb(breadcrumb, maxBreadcrumbs) {
        /* eslint-disable no-console */
        NATIVE.addBreadcrumb(breadcrumb);
        return super.addBreadcrumb(breadcrumb, maxBreadcrumbs);
    }
    /**
     * @inheritDoc
     */
    clearBreadcrumbs() {
        NATIVE.clearBreadcrumbs();
        return super.clearBreadcrumbs();
    }
}
//# sourceMappingURL=scope.js.map