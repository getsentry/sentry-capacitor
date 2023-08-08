Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceContext = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var wrapper_1 = require("../wrapper");
/** Load device context from native. */
var DeviceContext = /** @class */ (function () {
    function DeviceContext() {
        /**
         * @inheritDoc
         */
        this.name = DeviceContext.id;
    }
    /**
     * @inheritDoc
     */
    DeviceContext.prototype.setupOnce = function () {
        var _this = this;
        core_1.addGlobalEventProcessor(function (event) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var self, contexts, context, user, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = core_1.getCurrentHub().getIntegration(DeviceContext);
                        if (!self) {
                            return [2 /*return*/, event];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, wrapper_1.NATIVE.fetchNativeDeviceContexts()];
                    case 2:
                        contexts = _a.sent();
                        context = contexts['context'];
                        event.contexts = tslib_1.__assign(tslib_1.__assign({}, context), event.contexts);
                        if ('user' in contexts) {
                            user = contexts['user'];
                            if (!event.user) {
                                event.user = tslib_1.__assign({}, user);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        utils_1.logger.log("Failed to get device context from native: " + e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, event];
                }
            });
        }); });
    };
    /**
     * @inheritDoc
     */
    DeviceContext.id = 'DeviceContext';
    return DeviceContext;
}());
exports.DeviceContext = DeviceContext;
//# sourceMappingURL=devicecontext.js.map