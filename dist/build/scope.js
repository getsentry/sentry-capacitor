Object.defineProperty(exports, "__esModule", { value: true });
exports.CapacitorScope = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var wrapper_1 = require("./wrapper");
/**
 * Extends the scope methods to set scope on the Native SDKs
 */
var CapacitorScope = /** @class */ (function (_super) {
    tslib_1.__extends(CapacitorScope, _super);
    function CapacitorScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setUser = function (user) {
        wrapper_1.NATIVE.setUser(user);
        return _super.prototype.setUser.call(this, user);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setTag = function (key, value) {
        /* eslint-disable no-console */
        wrapper_1.NATIVE.setTag(key, value);
        return _super.prototype.setTag.call(this, key, value);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setTags = function (tags) {
        /* eslint-disable no-console */
        // As native only has setTag, we just loop through each tag key.
        Object.keys(tags).forEach(function (key) {
            wrapper_1.NATIVE.setTag(key, tags[key]);
        });
        return _super.prototype.setTags.call(this, tags);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setExtras = function (extras) {
        Object.keys(extras).forEach(function (key) {
            wrapper_1.NATIVE.setExtra(key, extras[key]);
        });
        return _super.prototype.setExtras.call(this, extras);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setExtra = function (key, extra) {
        wrapper_1.NATIVE.setExtra(key, extra);
        return _super.prototype.setExtra.call(this, key, extra);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.setContext = function (key, context) {
        wrapper_1.NATIVE.setContext(key, context);
        return _super.prototype.setContext.call(this, key, context);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.addBreadcrumb = function (breadcrumb, maxBreadcrumbs) {
        /* eslint-disable no-console */
        wrapper_1.NATIVE.addBreadcrumb(breadcrumb);
        return _super.prototype.addBreadcrumb.call(this, breadcrumb, maxBreadcrumbs);
    };
    /**
     * @inheritDoc
     */
    CapacitorScope.prototype.clearBreadcrumbs = function () {
        wrapper_1.NATIVE.clearBreadcrumbs();
        return _super.prototype.clearBreadcrumbs.call(this);
    };
    return CapacitorScope;
}(core_1.Scope));
exports.CapacitorScope = CapacitorScope;
//# sourceMappingURL=scope.js.map