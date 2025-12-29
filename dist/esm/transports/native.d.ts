import type { BaseTransportOptions, Envelope, PromiseBuffer, Transport, TransportMakeRequestResponse } from '@sentry/core';
export declare const DEFAULT_BUFFER_SIZE = 30;
export type BaseNativeTransport = BaseTransportOptions;
export interface BaseNativeTransportOptions {
    bufferSize?: number;
}
/** Native Transport class implementation */
export declare class NativeTransport implements Transport {
    /** A simple buffer holding all requests. */
    protected readonly _buffer: PromiseBuffer<TransportMakeRequestResponse>;
    constructor(options?: BaseNativeTransportOptions);
    /**
     * Sends the envelope to the Store endpoint in Sentry.
     *
     * @param envelope Envelope that should be sent to Sentry.
     */
    send(envelope: Envelope): PromiseLike<TransportMakeRequestResponse>;
    /**
     * Wait for all envelopes to be sent or the timeout to expire, whichever comes first.
     *
     * @param timeout Maximum time in ms the transport should wait for envelopes to be flushed. Omitting this parameter will
     *   cause the transport to wait until all events are sent before resolving the promise.
     * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
     * still events in the queue when the timeout is reached.
     */
    flush(timeout?: number): PromiseLike<boolean>;
}
/**
 * Creates a Native Transport.
 */
export declare function makeNativeTransport(options?: BaseNativeTransportOptions): NativeTransport;
/**
 * Creates a Native Transport factory if the native transport is available.
 */
export declare function makeNativeTransportFactory({ enableNative, }: {
    enableNative?: boolean;
}): typeof makeNativeTransport | null;
//# sourceMappingURL=native.d.ts.map