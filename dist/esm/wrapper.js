import { __awaiter, __rest } from "tslib";
import { Capacitor } from '@capacitor/core';
import { dropUndefinedKeys, logger, SentryError } from '@sentry/utils';
import { FilterNativeOptions } from './nativeOptions';
import { SentryCapacitor } from './plugin';
import { utf8ToBytes } from './vendor';
/**
 * Internal interface for calling native functions
 */
export const NATIVE = {
    /**
     * Sending the event over the bridge to native
     * @param event Event
     */
    sendEnvelope(envelope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enableNative) {
                throw this._DisabledNativeError;
            }
            if (!this.isNativeClientAvailable()) {
                throw this._NativeClientError;
            }
            const [EOL] = utf8ToBytes('\n');
            const [envelopeHeader, envelopeItems] = envelope;
            const headerString = JSON.stringify(envelopeHeader);
            let envelopeBytes = utf8ToBytes(headerString);
            envelopeBytes.push(EOL);
            for (const rawItem of envelopeItems) {
                const [itemHeader, itemPayload] = this._processItem(rawItem);
                let bytesContentType;
                let bytesPayload = [];
                if (typeof itemPayload === 'string') {
                    bytesContentType = 'text/plain';
                    bytesPayload = utf8ToBytes(itemPayload);
                }
                else if (itemPayload instanceof Uint8Array) {
                    bytesContentType = typeof itemHeader.content_type === 'string'
                        ? itemHeader.content_type
                        : 'application/octet-stream';
                    bytesPayload = [...itemPayload];
                }
                else {
                    bytesContentType = 'application/json';
                    bytesPayload = utf8ToBytes(JSON.stringify(itemPayload));
                }
                // Content type is not inside BaseEnvelopeItemHeaders.
                itemHeader.content_type = bytesContentType;
                itemHeader.length = bytesPayload.length;
                const serializedItemHeader = JSON.stringify(itemHeader);
                envelopeBytes.push(...utf8ToBytes(serializedItemHeader));
                envelopeBytes.push(EOL);
                envelopeBytes = envelopeBytes.concat(bytesPayload);
                envelopeBytes.push(EOL);
            }
            let transportStatusCode = 200;
            yield SentryCapacitor.captureEnvelope({ envelope: envelopeBytes })
                .then(_ => _ // We only want to know if it failed.
            , failed => {
                logger.error('Failed to capture Envelope: ', failed);
                transportStatusCode = 500;
            });
            return { statusCode: transportStatusCode };
        });
    },
    /**
     * Starts native with the provided options
     * @param options CapacitorOptions
     */
    initNativeSdk(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options.dsn) {
                logger.warn('Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.');
                return false;
            }
            if (!options.enableNative) {
                if (options.enableNativeNagger) {
                    logger.warn('Note: Native Sentry SDK is disabled.');
                }
                this.enableNative = false;
                return false;
            }
            if (!this.isNativeClientAvailable()) {
                throw this._NativeClientError;
            }
            // filter out all options that would crash native
            const filteredOptions = FilterNativeOptions(options);
            return SentryCapacitor.initNativeSdk({ options: filteredOptions });
        });
    },
    /**
     * Fetches the device contexts. Not used on Android.
     */
    fetchNativeDeviceContexts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enableNative) {
                throw this._DisabledNativeError;
            }
            if (!this.isNativeClientAvailable()) {
                throw this._NativeClientError;
            }
            if (this.platform !== 'ios') {
                // Only ios uses deviceContexts, return an empty object.
                return {};
            }
            return SentryCapacitor.fetchNativeDeviceContexts();
        });
    },
    /**
     * Fetches the release from native
     */
    fetchNativeRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enableNative) {
                throw this._DisabledNativeError;
            }
            return SentryCapacitor.fetchNativeRelease();
        });
    },
    fetchNativeSdkInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enableNative) {
                throw this._DisabledNativeError;
            }
            return SentryCapacitor.fetchNativeSdkInfo();
        });
    },
    /**
     * Triggers a native crash.
     * Use this only for testing purposes.
     */
    crash() {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        SentryCapacitor.crash();
    },
    /**
     * Sets the user in the native scope.
     * Passing null clears the user.
     * @param key string
     * @param value string
     */
    setUser(user) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        // separate and serialze all non-default user keys.
        let defaultUserKeys = null;
        let otherUserKeys = null;
        if (user) {
            const { id, ip_address, email, username } = user, otherKeys = __rest(user, ["id", "ip_address", "email", "username"]);
            defaultUserKeys = dropUndefinedKeys(this._serializeObject({
                email,
                id,
                ip_address,
                username,
            }));
            otherUserKeys = dropUndefinedKeys(this._serializeObject(otherKeys));
        }
        SentryCapacitor.setUser({ defaultUserKeys, otherUserKeys });
    },
    /**
     * Sets a tag in the native module.
     * @param key string
     * @param value string
     */
    setTag(key, value) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
        SentryCapacitor.setTag({ key, value: stringifiedValue });
    },
    /**
     * Sets an extra in the native scope, will stringify
     * extra value if it isn't already a string.
     * @param key string
     * @param extra any
     */
    setExtra(key, extra) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        // we stringify the extra as native only takes in strings.
        const stringifiedValue = typeof extra === 'string' ? extra : JSON.stringify(extra);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        SentryCapacitor.setExtra({ key, value: stringifiedValue });
    },
    /**
     * Adds breadcrumb to the native scope.
     * @param breadcrumb Breadcrumb
     */
    addBreadcrumb(breadcrumb) {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        SentryCapacitor.addBreadcrumb(Object.assign(Object.assign({}, breadcrumb), { 
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
    clearBreadcrumbs() {
        if (!this.enableNative) {
            return;
        }
        if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
        }
        SentryCapacitor.clearBreadcrumbs();
    },
    /**
     * Sets context on the native scope. Not implemented in Android yet.
     * @param key string
     * @param context key-value map
     */
    setContext(key, context) {
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
            SentryCapacitor.setContext({
                key,
                value: context !== null ? this._serializeObject(context) : null,
            });
        }
    },
    /**
     * Gets the event from envelopeItem and applies the level filter to the selected event.
     * @param data An envelope item containing the event.
     * @returns The event from envelopeItem or undefined.
     */
    _processItem(item) {
        if (NATIVE.platform === 'android') {
            const [itemHeader, itemPayload] = item;
            if (itemHeader.type == 'event' || itemHeader.type == 'transaction') {
                const event = this._processLevels(itemPayload);
                if ('message' in event) {
                    // @ts-ignore Android still uses the old message object, without this the serialization of events will break.
                    event.message = { message: event.message };
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
                if (event.breadcrumbs) {
                    event.breadcrumbs = [];
                }
                return [itemHeader, event];
            }
        }
        return item;
    },
    /**
     * Serializes all values of root-level keys into strings.
     * @param data key-value map.
     * @returns An object where all root-level values are strings.
     */
    _serializeObject(data) {
        // safely handles circular references
        const safeStringify = (obj) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let cache = [];
            const retVal = JSON.stringify(obj, (_key, value) => typeof value === 'object' && value !== null
                ? cache.includes(value)
                    ? '[Circular...]' // Duplicate reference found, discard key
                    : cache.push(value) && value // Store value in our collection
                : value);
            cache = [];
            return retVal;
        };
        // deserialize
        const serialized = {};
        Object.keys(data).forEach(dataKey => {
            const value = data[dataKey];
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
    _processLevels(event) {
        var _a;
        const processed = Object.assign(Object.assign({}, event), { level: event.level ? this._processLevel(event.level) : undefined, breadcrumbs: (_a = event.breadcrumbs) === null || _a === void 0 ? void 0 : _a.map(breadcrumb => (Object.assign(Object.assign({}, breadcrumb), { level: breadcrumb.level
                    ? this._processLevel(breadcrumb.level)
                    : undefined }))) });
        return processed;
    },
    /**
     * Convert js severity level which has critical and log to more widely supported levels.
     * @param level
     * @returns More widely supported Severity level strings
     */
    _processLevel(level) {
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
    isModuleLoaded() {
        return !!SentryCapacitor;
    },
    /**
     *  Checks whether the SentryCapacitor module is loaded and the native client is available
     */
    isNativeClientAvailable() {
        return (this.isModuleLoaded() && Capacitor.isPluginAvailable('SentryCapacitor'));
    },
    _DisabledNativeError: new SentryError('Native is disabled'),
    _NativeClientError: new SentryError("Native Client is not available, can't start on native."),
    enableNative: true,
    platform: Capacitor.getPlatform(),
};
//# sourceMappingURL=wrapper.js.map