Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVE = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@capacitor/core");
var utils_1 = require("@sentry/utils");
var nativeOptions_1 = require("./nativeOptions");
var plugin_1 = require("./plugin");
var vendor_1 = require("./vendor");
/**
 * Internal interface for calling native functions
 */
exports.NATIVE = {
    /**
     * Sending the event over the bridge to native
     * @param event Event
     */
    sendEnvelope: function (envelope) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, EOL, _b, envelopeHeader, envelopeItems, headerString, envelopeBytes, envelopeItems_1, envelopeItems_1_1, rawItem, _c, itemHeader, itemPayload, bytesContentType, bytesPayload, serializedItemHeader, transportStatusCode;
            var e_1, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.enableNative) {
                            throw this._DisabledNativeError;
                        }
                        if (!this.isNativeClientAvailable()) {
                            throw this._NativeClientError;
                        }
                        _a = tslib_1.__read(vendor_1.utf8ToBytes('\n'), 1), EOL = _a[0];
                        _b = tslib_1.__read(envelope, 2), envelopeHeader = _b[0], envelopeItems = _b[1];
                        headerString = JSON.stringify(envelopeHeader);
                        envelopeBytes = vendor_1.utf8ToBytes(headerString);
                        envelopeBytes.push(EOL);
                        try {
                            for (envelopeItems_1 = tslib_1.__values(envelopeItems), envelopeItems_1_1 = envelopeItems_1.next(); !envelopeItems_1_1.done; envelopeItems_1_1 = envelopeItems_1.next()) {
                                rawItem = envelopeItems_1_1.value;
                                _c = tslib_1.__read(this._processItem(rawItem), 2), itemHeader = _c[0], itemPayload = _c[1];
                                bytesContentType = void 0;
                                bytesPayload = [];
                                if (typeof itemPayload === 'string') {
                                    bytesContentType = 'text/plain';
                                    bytesPayload = vendor_1.utf8ToBytes(itemPayload);
                                }
                                else if (itemPayload instanceof Uint8Array) {
                                    bytesContentType = typeof itemHeader.content_type === 'string'
                                        ? itemHeader.content_type
                                        : 'application/octet-stream';
                                    bytesPayload = tslib_1.__spread(itemPayload);
                                }
                                else {
                                    bytesContentType = 'application/json';
                                    bytesPayload = vendor_1.utf8ToBytes(JSON.stringify(itemPayload));
                                }
                                // Content type is not inside BaseEnvelopeItemHeaders.
                                itemHeader.content_type = bytesContentType;
                                itemHeader.length = bytesPayload.length;
                                serializedItemHeader = JSON.stringify(itemHeader);
                                envelopeBytes.push.apply(envelopeBytes, tslib_1.__spread(vendor_1.utf8ToBytes(serializedItemHeader)));
                                envelopeBytes.push(EOL);
                                envelopeBytes = envelopeBytes.concat(bytesPayload);
                                envelopeBytes.push(EOL);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (envelopeItems_1_1 && !envelopeItems_1_1.done && (_d = envelopeItems_1.return)) _d.call(envelopeItems_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        transportStatusCode = 200;
                        return [4 /*yield*/, plugin_1.SentryCapacitor.captureEnvelope({ envelope: envelopeBytes })
                                .then(function (_) { return _; } // We only want to know if it failed.
                            , function (failed) {
                                utils_1.logger.error('Failed to capture Envelope: ', failed);
                                transportStatusCode = 500;
                            })];
                    case 1:
                        _e.sent();
                        return [2 /*return*/, { statusCode: transportStatusCode }];
                }
            });
        });
    },
    /**
     * Starts native with the provided options
     * @param options CapacitorOptions
     */
    initNativeSdk: function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var filteredOptions;
            return tslib_1.__generator(this, function (_a) {
                if (!options.dsn) {
                    utils_1.logger.warn('Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.');
                    return [2 /*return*/, false];
                }
                if (!options.enableNative) {
                    if (options.enableNativeNagger) {
                        utils_1.logger.warn('Note: Native Sentry SDK is disabled.');
                    }
                    this.enableNative = false;
                    return [2 /*return*/, false];
                }
                if (!this.isNativeClientAvailable()) {
                    throw this._NativeClientError;
                }
                filteredOptions = nativeOptions_1.FilterNativeOptions(options);
                return [2 /*return*/, plugin_1.SentryCapacitor.initNativeSdk({ options: filteredOptions })];
            });
        });
    },
    /**
     * Fetches the device contexts. Not used on Android.
     */
    fetchNativeDeviceContexts: function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this.enableNative) {
                    throw this._DisabledNativeError;
                }
                if (!this.isNativeClientAvailable()) {
                    throw this._NativeClientError;
                }
                if (this.platform !== 'ios') {
                    // Only ios uses deviceContexts, return an empty object.
                    return [2 /*return*/, {}];
                }
                return [2 /*return*/, plugin_1.SentryCapacitor.fetchNativeDeviceContexts()];
            });
        });
    },
    /**
     * Fetches the release from native
     */
    fetchNativeRelease: function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this.enableNative) {
                    throw this._DisabledNativeError;
                }
                return [2 /*return*/, plugin_1.SentryCapacitor.fetchNativeRelease()];
            });
        });
    },
    fetchNativeSdkInfo: function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this.enableNative) {
                    throw this._DisabledNativeError;
                }
                return [2 /*return*/, plugin_1.SentryCapacitor.fetchNativeSdkInfo()];
            });
        });
    },
    /**
     * Triggers a native crash.
     * Use this only for testing purposes.
     */
    crash: function () {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        plugin_1.SentryCapacitor.crash();
    },
    /**
     * Sets the user in the native scope.
     * Passing null clears the user.
     * @param key string
     * @param value string
     */
    setUser: function (user) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        // separate and serialze all non-default user keys.
        var defaultUserKeys = null;
        var otherUserKeys = null;
        if (user) {
            var id = user.id, ip_address = user.ip_address, email = user.email, username = user.username, otherKeys = tslib_1.__rest(user, ["id", "ip_address", "email", "username"]);
            defaultUserKeys = utils_1.dropUndefinedKeys(this._serializeObject({
                email: email,
                id: id,
                ip_address: ip_address,
                username: username,
            }));
            otherUserKeys = utils_1.dropUndefinedKeys(this._serializeObject(otherKeys));
        }
        plugin_1.SentryCapacitor.setUser({ defaultUserKeys: defaultUserKeys, otherUserKeys: otherUserKeys });
    },
    /**
     * Sets a tag in the native module.
     * @param key string
     * @param value string
     */
    setTag: function (key, value) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        var stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
        plugin_1.SentryCapacitor.setTag({ key: key, value: stringifiedValue });
    },
    /**
     * Sets an extra in the native scope, will stringify
     * extra value if it isn't already a string.
     * @param key string
     * @param extra any
     */
    setExtra: function (key, extra) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        // we stringify the extra as native only takes in strings.
        var stringifiedValue = typeof extra === 'string' ? extra : JSON.stringify(extra);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        plugin_1.SentryCapacitor.setExtra({ key: key, value: stringifiedValue });
    },
    /**
     * Adds breadcrumb to the native scope.
     * @param breadcrumb Breadcrumb
     */
    addBreadcrumb: function (breadcrumb) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        plugin_1.SentryCapacitor.addBreadcrumb(tslib_1.__assign(tslib_1.__assign({}, breadcrumb), { 
            // Process and convert deprecated levels
            level: breadcrumb.level
                ? this._processLevel(breadcrumb.level)
                : undefined, data: breadcrumb.data
                ? this._serializeObject(breadcrumb.data)
                : undefined }));
    },
    /**
     * Clears breadcrumbs on the native scope.
     */
    clearBreadcrumbs: function () {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        plugin_1.SentryCapacitor.clearBreadcrumbs();
    },
    /**
     * Sets context on the native scope. Not implemented in Android yet.
     * @param key string
     * @param context key-value map
     */
    setContext: function (key, context) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        if (this.platform === 'android') {
            // setContext not available on the Android SDK yet.
            this.setExtra(key, context);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            plugin_1.SentryCapacitor.setContext({
                key: key,
                value: context !== null ? this._serializeObject(context) : null,
            });
        }
    },
    /**
     * Gets the event from envelopeItem and applies the level filter to the selected event.
     * @param data An envelope item containing the event.
     * @returns The event from envelopeItem or undefined.
     */
    _processItem: function (item) {
        if (exports.NATIVE.platform === 'android') {
            var _a = tslib_1.__read(item, 2), itemHeader = _a[0], itemPayload = _a[1];
            if (itemHeader.type == 'event' || itemHeader.type == 'transaction') {
                var event_1 = this._processLevels(itemPayload);
                if ('message' in event_1) {
                    // @ts-ignore Android still uses the old message object, without this the serialization of events will break.
                    event_1.message = { message: event_1.message };
                }
                /*
              We do this to avoid duplicate breadcrumbs on Android as sentry-android applies the breadcrumbs
              from the native scope onto every envelope sent through it. This scope will contain the breadcrumbs
              sent through the scope sync feature. This causes duplicate breadcrumbs.
              We then remove the breadcrumbs in all cases but if it is handled == false,
              this is a signal that the app would crash and android would lose the breadcrumbs by the time the app is restarted to read
              the envelope.
              Since unhandled errors from Javascript are not going to crash the App, we can't rely on the
              handled flag for filtering breadcrumbs.
                */
                if (event_1.breadcrumbs) {
                    event_1.breadcrumbs = [];
                }
                return [itemHeader, event_1];
            }
        }
        return item;
    },
    /**
     * Serializes all values of root-level keys into strings.
     * @param data key-value map.
     * @returns An object where all root-level values are strings.
     */
    _serializeObject: function (data) {
        // safely handles circular references
        var safeStringify = function (obj) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var cache = [];
            var retVal = JSON.stringify(obj, function (_key, value) {
                return typeof value === 'object' && value !== null
                    ? cache.includes(value)
                        ? '[Circular...]' // Duplicate reference found, discard key
                        : cache.push(value) && value // Store value in our collection
                    : value;
            });
            cache = [];
            return retVal;
        };
        // deserialize
        var serialized = {};
        Object.keys(data).forEach(function (dataKey) {
            var value = data[dataKey];
            serialized[dataKey] =
                typeof value === 'string' ? value : safeStringify(value);
        });
        return serialized;
    },
    /**
     * Convert js severity level in event.level and event.breadcrumbs to more widely supported levels.
     * @param event
     * @returns Event with more widely supported Severity level strings
     */
    _processLevels: function (event) {
        var _this = this;
        var _a;
        var processed = tslib_1.__assign(tslib_1.__assign({}, event), { level: event.level ? this._processLevel(event.level) : undefined, breadcrumbs: (_a = event.breadcrumbs) === null || _a === void 0 ? void 0 : _a.map(function (breadcrumb) { return (tslib_1.__assign(tslib_1.__assign({}, breadcrumb), { level: breadcrumb.level
                    ? _this._processLevel(breadcrumb.level)
                    : undefined })); }) });
        return processed;
    },
    /**
     * Convert js severity level which has critical and log to more widely supported levels.
     * @param level
     * @returns More widely supported Severity level strings
     */
    _processLevel: function (level) {
        if (level == 'log') {
            return 'debug';
        }
        else if (level == 'critical') {
            return 'fatal';
        }
        return level;
    },
    /**
     * Checks whether the SentryCapacitor module is loaded.
     */
    isModuleLoaded: function () {
        return !!plugin_1.SentryCapacitor;
    },
    /**
     *  Checks whether the SentryCapacitor module is loaded and the native client is available
     */
    isNativeClientAvailable: function () {
        return (this.isModuleLoaded() && core_1.Capacitor.isPluginAvailable('SentryCapacitor'));
    },
    _DisabledNativeError: new utils_1.SentryError('Native is disabled'),
    _NativeClientError: new utils_1.SentryError("Native Client is not available, can't start on native."),
    enableNative: true,
    platform: core_1.Capacitor.getPlatform(),
};
//# sourceMappingURL=wrapper.js.map