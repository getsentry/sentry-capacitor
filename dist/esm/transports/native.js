import { makePromiseBuffer } from '@sentry/core';
import { NATIVE } from '../wrapper';
export const DEFAULT_BUFFER_SIZE = 30;
/** Native Transport class implementation */
export class NativeTransport {
    constructor(options = {}) {
        this._buffer = makePromiseBuffer(options.bufferSize || DEFAULT_BUFFER_SIZE);
    }
    /**
     * Sends the envelope to the Store endpoint in Sentry.
     *
     * @param envelope Envelope that should be sent to Sentry.
     */
    send(envelope) {
        return this._buffer.add(() => NATIVE.sendEnvelope(envelope));
    }
    /**
     * Wait for all envelopes to be sent or the timeout to expire, whichever comes first.
     *
     * @param timeout Maximum time in ms the transport should wait for envelopes to be flushed. Omitting this parameter will
     *   cause the transport to wait until all events are sent before resolving the promise.
     * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
     * still events in the queue when the timeout is reached.
     */
    flush(timeout) {
        return this._buffer.drain(timeout);
    }
}
/**
 * Creates a Native Transport.
 */
export function makeNativeTransport(options = {}) {
    return new NativeTransport(options);
}
/**
 * Creates a Native Transport factory if the native transport is available.
 */
export function makeNativeTransportFactory({ enableNative, }) {
    if (enableNative && NATIVE.isNativeClientAvailable()) {
        return makeNativeTransport;
    }
    return null;
}
//# sourceMappingURL=native.js.map