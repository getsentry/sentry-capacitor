import { defaultIntegrations, init as browserInit } from '@sentry/browser';
import { Hub, makeMain } from '@sentry/core';
import { RewriteFrames } from '@sentry/integrations';
import { DeviceContext, EventOrigin, SdkInfo } from './integrations';
import { CapacitorScope } from './scope';
import { DEFAULT_BUFFER_SIZE, makeNativeTransport } from './transports/native';
import { makeUtf8TextEncoder } from './transports/TextEncoder';
import { NATIVE } from './wrapper';
/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export function init(passedOptions, originalInit = browserInit) {
    var _a, _b, _c;
    const finalOptions = Object.assign({ enableAutoSessionTracking: true, enableOutOfMemoryTracking: true }, passedOptions);
    if (finalOptions.enabled === false ||
        NATIVE.platform === 'web') {
        finalOptions.enableNative = false;
        finalOptions.enableNativeNagger = false;
    }
    else {
        // keep the original value if user defined it.
        (_a = finalOptions.enableNativeNagger) !== null && _a !== void 0 ? _a : (finalOptions.enableNativeNagger = true);
        (_b = finalOptions.enableNative) !== null && _b !== void 0 ? _b : (finalOptions.enableNative = true);
    }
    const capacitorHub = new Hub(undefined, new CapacitorScope());
    makeMain(capacitorHub);
    finalOptions.defaultIntegrations = [
        ...defaultIntegrations,
        new RewriteFrames({
            iteratee: (frame) => {
                if (frame.filename) {
                    const isReachableHost = /^https?:\/\//.test(frame.filename);
                    frame.filename = frame.filename
                        .replace(/^https?:\/\/localhost(:\d+)?/, '')
                        .replace(/^ng:\/\//, '')
                        .replace(/^capacitor:\/\/localhost(:\d+)?/, '');
                    const isNativeFrame = frame.filename === '[native code]' || frame.filename === 'native';
                    if (!isNativeFrame) {
                        // We don't need to use `app://` protocol for http(s) based hosts
                        if (!isReachableHost) {
                            // We always want to have a triple slash
                            const filename = frame.filename.startsWith('/') ? frame.filename : `/${frame.filename}`;
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
            },
        }),
        new SdkInfo(),
        new EventOrigin(),
    ];
    if (finalOptions.enableNative) {
        finalOptions.defaultIntegrations.push(new DeviceContext());
        if (!passedOptions.transport && NATIVE.platform !== 'web') {
            finalOptions.transport = passedOptions.transport
                || makeNativeTransport;
            finalOptions.transportOptions = Object.assign(Object.assign({ textEncoder: makeUtf8TextEncoder() }, ((_c = passedOptions.transportOptions) !== null && _c !== void 0 ? _c : {})), { bufferSize: DEFAULT_BUFFER_SIZE });
        }
    }
    const browserOptions = Object.assign(Object.assign({}, finalOptions), { autoSessionTracking: NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking });
    const mobileOptions = Object.assign(Object.assign({}, finalOptions), { enableAutoSessionTracking: NATIVE.platform !== 'web' && finalOptions.enableAutoSessionTracking });
    // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
    // feature from the NATIVE SDK without the options being set.
    void NATIVE.initNativeSdk(mobileOptions);
    originalInit(browserOptions);
}
/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash() {
    NATIVE.crash();
}
//# sourceMappingURL=sdk.js.map