import { __awaiter } from "tslib";
import { addGlobalEventProcessor, getCurrentHub } from '@sentry/core';
import { logger } from '@sentry/utils';
import { NATIVE } from '../wrapper';
/** Load device context from native. */
export class DeviceContext {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = DeviceContext.id;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        addGlobalEventProcessor((event) => __awaiter(this, void 0, void 0, function* () {
            const self = getCurrentHub().getIntegration(DeviceContext);
            if (!self) {
                return event;
            }
            try {
                const contexts = yield NATIVE.fetchNativeDeviceContexts();
                const context = contexts['context'];
                event.contexts = Object.assign(Object.assign({}, context), event.contexts);
                if ('user' in contexts) {
                    const user = contexts['user'];
                    if (!event.user) {
                        event.user = Object.assign({}, user);
                    }
                }
            }
            catch (e) {
                logger.log(`Failed to get device context from native: ${e}`);
            }
            return event;
        }));
    }
}
/**
 * @inheritDoc
 */
DeviceContext.id = 'DeviceContext';
//# sourceMappingURL=devicecontext.js.map