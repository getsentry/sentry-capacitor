Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkInfo = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
var version_1 = require("../version");
var wrapper_1 = require("../wrapper");
/** Default SdkInfo instrumentation */
var SdkInfo = /** @class */ (function () {
    function SdkInfo() {
        /**
         * @inheritDoc
         */
        this.name = SdkInfo.id;
        this._nativeSdkPackage = null;
    }
    /**
     * @inheritDoc
     */
    SdkInfo.prototype.setupOnce = function (addGlobalEventProcessor) {
        var _this = this;
        addGlobalEventProcessor(function (event) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, _1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(wrapper_1.NATIVE.platform === 'ios' && this._nativeSdkPackage === null)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, wrapper_1.NATIVE.fetchNativeSdkInfo()];
                    case 2:
                        _a._nativeSdkPackage = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _1 = _b.sent();
                        // If this fails, go ahead as usual as we would rather have the event be sent with a package missing.
                        utils_1.logger.warn('[SdkInfo] Native SDK Info retrieval failed...something could be wrong with your Sentry installation.');
                        return [3 /*break*/, 4];
                    case 4:
                        event.platform = event.platform || 'javascript';
                        event.sdk = event.sdk || {};
                        event.sdk.name = event.sdk.name || version_1.SDK_NAME;
                        event.sdk.version = event.sdk.version || version_1.SDK_VERSION;
                        event.sdk.packages = tslib_1.__spread((event.sdk.packages || []), ((this._nativeSdkPackage && [this._nativeSdkPackage]) || []), [
                            {
                                name: 'npm:@sentry/capacitor',
                                version: version_1.SDK_VERSION,
                            },
                        ]);
                        return [2 /*return*/, event];
                }
            });
        }); });
    };
    /**
     * @inheritDoc
     */
    SdkInfo.id = 'SdkInfo';
    return SdkInfo;
}());
exports.SdkInfo = SdkInfo;
//# sourceMappingURL=sdkinfo.js.map