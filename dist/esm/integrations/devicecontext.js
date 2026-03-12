import { debug } from '@sentry/core';
import { NATIVE } from '../wrapper';
const INTEGRATION_NAME = 'DeviceContext';
export const deviceContextIntegration = () => {
    return {
        name: INTEGRATION_NAME,
        processEvent: processEvent,
    };
};
async function processEvent(event) {
    try {
        const contexts = await NATIVE.fetchNativeDeviceContexts();
        const context = contexts['context'];
        event.contexts = { ...context, ...event.contexts };
        if ('user' in contexts) {
            const user = contexts['user'];
            if (!event.user) {
                event.user = { ...user };
            }
        }
    }
    catch (e) {
        debug.log(`Failed to get device context from native: ${e}`);
    }
    return event;
}
//# sourceMappingURL=devicecontext.js.map