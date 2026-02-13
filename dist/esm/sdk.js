import { init as browserInit } from '@sentry/browser';
import { debug, getClient, getGlobalScope, getIntegrationsToSetup, getIsolationScope } from '@sentry/core';
import { getDefaultIntegrations } from './integrations/default';
import { enableSyncToNative } from './scopeSync';
import { useEncodePolyfill } from './transports/encodePolyfill';
import { DEFAULT_BUFFER_SIZE, makeNativeTransport } from './transports/native';
import { safeFactory } from './utils/safeFactory';
import { IsTextEncoderAvailable } from './utils/textEncoder';
import { NATIVE } from './wrapper';
/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
export function init(passedOptions, originalInit = browserInit) {
    var _a, _b, _c;
    const finalOptions = {
        enableAutoSessionTracking: true,
        enableWatchdogTerminationTracking: true,
        enableCaptureFailedRequests: false,
        ...passedOptions,
    };
    if (finalOptions.enabled === false || NATIVE.platform === 'web') {
        finalOptions.enableNative = false;
        finalOptions.enableNativeNagger = false;
    }
    else {
        // keep the original value if user defined it.
        (_a = finalOptions.enableNativeNagger) !== null && _a !== void 0 ? _a : (finalOptions.enableNativeNagger = true);
        (_b = finalOptions.enableNative) !== null && _b !== void 0 ? _b : (finalOptions.enableNative = true);
    }
    //  const capacitorHub = new Hub(undefined, new CapacitorScope());
    //  makeMain(capacitorHub);
    const defaultIntegrations = passedOptions.defaultIntegrations === undefined
        ? getDefaultIntegrations(passedOptions)
        : passedOptions.defaultIntegrations;
    finalOptions.integrations = getIntegrationsToSetup({
        integrations: safeFactory(passedOptions.integrations, {
            loggerMessage: 'The integrations threw an error',
        }),
        defaultIntegrations,
    });
    if (finalOptions.enableNative &&
        !passedOptions.transport &&
        NATIVE.platform !== 'web') {
        finalOptions.transport = passedOptions.transport || makeNativeTransport;
        finalOptions.transportOptions = {
            ...((_c = passedOptions.transportOptions) !== null && _c !== void 0 ? _c : {}),
            bufferSize: DEFAULT_BUFFER_SIZE,
        };
    }
    if (!IsTextEncoderAvailable()) {
        useEncodePolyfill();
    }
    if (finalOptions.enableNative) {
        enableSyncToNative(getGlobalScope());
        enableSyncToNative(getIsolationScope());
    }
    const browserOptions = {
        ...finalOptions,
        autoSessionTracking: NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking,
    };
    const mobileOptions = {
        ...finalOptions,
        enableAutoSessionTracking: NATIVE.platform !== 'web' && finalOptions.enableAutoSessionTracking,
    };
    // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
    // feature from the NATIVE SDK without the options being set.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void NATIVE.initNativeSdk(mobileOptions);
    originalInit(browserOptions);
}
/**
 * Closes the SDK, stops sending events.
 */
export async function close() {
    try {
        const client = getClient();
        if (client) {
            await client.close();
            await NATIVE.closeNativeSdk();
        }
    }
    catch (e) {
        debug.error('Failed to close the SDK');
    }
}
/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
export function nativeCrash() {
    NATIVE.crash();
}
//# sourceMappingURL=sdk.js.map