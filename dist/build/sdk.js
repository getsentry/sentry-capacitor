Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeCrash = exports.init = void 0;
var tslib_1 = require("tslib");
var browser_1 = require("@sentry/browser");
var core_1 = require("@sentry/core");
var integrations_1 = require("@sentry/integrations");
var integrations_2 = require("./integrations");
var scope_1 = require("./scope");
var native_1 = require("./transports/native");
var TextEncoder_1 = require("./transports/TextEncoder");
var wrapper_1 = require("./wrapper");
/**
 * Initializes the Capacitor SDK alongside a sibling Sentry SDK
 * @param options Options for the SDK
 * @param originalInit The init function of the sibling SDK, leave blank to initialize with `@sentry/browser`
 */
function init(passedOptions, originalInit) {
    var _a, _b, _c;
    if (originalInit === void 0) { originalInit = browser_1.init; }
    var finalOptions = tslib_1.__assign({ enableAutoSessionTracking: true, enableOutOfMemoryTracking: true }, passedOptions);
    if (finalOptions.enabled === false ||
        wrapper_1.NATIVE.platform === 'web') {
        finalOptions.enableNative = false;
        finalOptions.enableNativeNagger = false;
    }
    else {
        // keep the original value if user defined it.
        (_a = finalOptions.enableNativeNagger) !== null && _a !== void 0 ? _a : (finalOptions.enableNativeNagger = true);
        (_b = finalOptions.enableNative) !== null && _b !== void 0 ? _b : (finalOptions.enableNative = true);
    }
    var capacitorHub = new core_1.Hub(undefined, new scope_1.CapacitorScope());
    core_1.makeMain(capacitorHub);
    finalOptions.defaultIntegrations = tslib_1.__spread(browser_1.defaultIntegrations, [
        new integrations_1.RewriteFrames({
            iteratee: function (frame) {
                if (frame.filename) {
                    var isReachableHost = /^https?:\/\//.test(frame.filename);
                    frame.filename = frame.filename
                        .replace(/^https?:\/\/localhost(:\d+)?/, '')
                        .replace(/^ng:\/\//, '')
                        .replace(/^capacitor:\/\/localhost(:\d+)?/, '');
                    var isNativeFrame = frame.filename === '[native code]' || frame.filename === 'native';
                    if (!isNativeFrame) {
                        // We don't need to use `app://` protocol for http(s) based hosts
                        if (!isReachableHost) {
                            // We always want to have a triple slash
                            var filename = frame.filename.startsWith('/') ? frame.filename : "/" + frame.filename;
                            var appPrefix = 'app://';
                            frame.filename = "" + appPrefix + filename;
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
        new integrations_2.SdkInfo(),
        new integrations_2.EventOrigin(),
    ]);
    if (finalOptions.enableNative) {
        finalOptions.defaultIntegrations.push(new integrations_2.DeviceContext());
        if (!passedOptions.transport && wrapper_1.NATIVE.platform !== 'web') {
            finalOptions.transport = passedOptions.transport
                || native_1.makeNativeTransport;
            finalOptions.transportOptions = tslib_1.__assign(tslib_1.__assign({ textEncoder: TextEncoder_1.makeUtf8TextEncoder() }, ((_c = passedOptions.transportOptions) !== null && _c !== void 0 ? _c : {})), { bufferSize: native_1.DEFAULT_BUFFER_SIZE });
        }
    }
    var browserOptions = tslib_1.__assign(tslib_1.__assign({}, finalOptions), { autoSessionTracking: wrapper_1.NATIVE.platform === 'web' && finalOptions.enableAutoSessionTracking });
    var mobileOptions = tslib_1.__assign(tslib_1.__assign({}, finalOptions), { enableAutoSessionTracking: wrapper_1.NATIVE.platform !== 'web' && finalOptions.enableAutoSessionTracking });
    // We first initialize the NATIVE SDK to avoid the Javascript SDK to invoke any
    // feature from the NATIVE SDK without the options being set.
    void wrapper_1.NATIVE.initNativeSdk(mobileOptions);
    originalInit(browserOptions);
}
exports.init = init;
/**
 * If native client is available it will trigger a native crash
 * Use this only for testing purposes
 */
function nativeCrash() {
    wrapper_1.NATIVE.crash();
}
exports.nativeCrash = nativeCrash;
//# sourceMappingURL=sdk.js.map