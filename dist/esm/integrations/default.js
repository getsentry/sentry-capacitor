import { deviceContextIntegration } from './devicecontext';
import { eventOriginIntegration } from './eventorigin';
import { nativeReleaseIntegration } from './release';
import { capacitorRewriteFramesIntegration } from './rewriteframes';
import { sdkInfoIntegration } from './sdkinfo';
/**
 * Returns the default Capacitor integrations based on the current environment.
 */
export function getDefaultIntegrations(options) {
    const integrations = [];
    integrations.push(capacitorRewriteFramesIntegration());
    integrations.push(nativeReleaseIntegration());
    integrations.push(eventOriginIntegration());
    integrations.push(sdkInfoIntegration());
    if (options.enableNative) {
        integrations.push(deviceContextIntegration());
    }
    return integrations;
}
//# sourceMappingURL=default.js.map