Object.defineProperty(exports, "__esModule", { value: true });
exports.makeNativeTransportFactory = exports.makeNativeTransport = exports.NativeTransport = exports.DEFAULT_BUFFER_SIZE = void 0;
var utils_1 = require("@sentry/utils");
var wrapper_1 = require("../wrapper");
exports.DEFAULT_BUFFER_SIZE = 30;
/** Native Transport class implementation */
var NativeTransport = /** @class */ (function () {
    function NativeTransport(options) {
        if (options === void 0) { options = {}; }
        this._buffer = utils_1.makePromiseBuffer(options.bufferSize || exports.DEFAULT_BUFFER_SIZE);
    }
    /**
     * Sends the envelope to the Store endpoint in Sentry.
     *
     * @param envelope Envelope that should be sent to Sentry.
     */
    NativeTransport.prototype.send = function (envelope) {
        return this._buffer.add(function () { return wrapper_1.NATIVE.sendEnvelope(envelope); });
    };
    /**
     * Wait for all envelopes to be sent or the timeout to expire, whichever comes first.
     *
     * @param timeout Maximum time in ms the transport should wait for envelopes to be flushed. Omitting this parameter will
     *   cause the transport to wait until all events are sent before resolving the promise.
     * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
     * still events in the queue when the timeout is reached.
     */
    NativeTransport.prototype.flush = function (timeout) {
        return this._buffer.drain(timeout);
    };
    return NativeTransport;
}());
exports.NativeTransport = NativeTransport;
/**
 * Creates a Native Transport.
 */
function makeNativeTransport(options) {
    if (options === void 0) { options = {}; }
    return new NativeTransport(options);
}
exports.makeNativeTransport = makeNativeTransport;
/**
 * Creates a Native Transport factory if the native transport is available.
 */
function makeNativeTransportFactory(_a) {
    var enableNative = _a.enableNative;
    if (enableNative && wrapper_1.NATIVE.isNativeClientAvailable()) {
        return makeNativeTransport;
    }
    return null;
}
exports.makeNativeTransportFactory = makeNativeTransportFactory;
//# sourceMappingURL=native.js.map