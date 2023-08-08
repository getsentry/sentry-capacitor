import { Scope } from '@sentry/core';
import type { Breadcrumb, User } from '@sentry/types';
/**
 * Extends the scope methods to set scope on the Native SDKs
 */
export declare class CapacitorScope extends Scope {
    /**
     * @inheritDoc
     */
    setUser(user: User | null): this;
    /**
     * @inheritDoc
     */
    setTag(key: string, value: string): this;
    /**
     * @inheritDoc
     */
    setTags(tags: {
        [key: string]: string;
    }): this;
    /**
     * @inheritDoc
     */
    setExtras(extras: {
        [key: string]: unknown;
    }): this;
    /**
     * @inheritDoc
     */
    setExtra(key: string, extra: unknown): this;
    /**
     * @inheritDoc
     */
    setContext(key: string, context: {
        [key: string]: unknown;
    } | null): this;
    /**
     * @inheritDoc
     */
    addBreadcrumb(breadcrumb: Breadcrumb, maxBreadcrumbs?: number): this;
    /**
     * @inheritDoc
     */
    clearBreadcrumbs(): this;
}
//# sourceMappingURL=scope.d.ts.map