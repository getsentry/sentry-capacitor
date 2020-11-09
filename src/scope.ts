import { Scope } from '@sentry/hub';

import { NATIVE } from './wrapper';

/**
 * Extends the scope methods to set scope on the Native SDKs
 */
export class CapacitorScope extends Scope {
    /**
     * @inheritDoc
     */
    public setContext(key: string, context: { [key: string]: any; } | null): this {
        NATIVE.setContext(key, context);
        return super.setContext(key, context);
    }
}