import { makeFetchTransport } from '@sentry/browser';
import type {   BaseTransportOptions,
  Envelope,
PromiseBuffer ,
  Transport,
  TransportMakeRequestResponse,
} from '@sentry/core';
import { makePromiseBuffer } from '@sentry/core';
import { NATIVE } from '../wrapper';

export const DEFAULT_BUFFER_SIZE = 30;

export type BaseNativeTransport = BaseTransportOptions;

export interface BaseNativeTransportOptions {
  bufferSize?: number;
}

/** Native Transport class implementation */
export class NativeTransport implements Transport {
  /** A simple buffer holding all requests. */
  protected readonly _buffer: PromiseBuffer<TransportMakeRequestResponse>;

  private _fallback?: Transport;

  public constructor(private readonly _options: BaseNativeTransportOptions = {}) {
    const options = _options;
    this._buffer = makePromiseBuffer(options.bufferSize || DEFAULT_BUFFER_SIZE);
  }

  /**
   * Sends the envelope to the Store endpoint in Sentry.
   *
   * @param envelope Envelope that should be sent to Sentry.
   */
  public send(envelope: Envelope): PromiseLike<TransportMakeRequestResponse> {
    return this._buffer.add(async () => {
      // Events captured before the native SDK is ready wait for it.
      const nativeReady = NATIVE.nativeReady ? await NATIVE.nativeReady : true;
      if (nativeReady) {
        return NATIVE.sendEnvelope(envelope);
      }
      // Native is unavailable: send through the JS transport instead of dropping.
      this._fallback ??= makeFetchTransport(this._options as Parameters<typeof makeFetchTransport>[0]);
      return this._fallback.send(envelope);
    });
  }

  /**
   * Wait for all envelopes to be sent or the timeout to expire, whichever comes first.
   *
   * @param timeout Maximum time in ms the transport should wait for envelopes to be flushed. Omitting this parameter will
   *   cause the transport to wait until all events are sent before resolving the promise.
   * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
   * still events in the queue when the timeout is reached.
   */
  public flush(timeout?: number): PromiseLike<boolean> {
    return this._buffer.drain(timeout);
  }
}

/**
 * Creates a Native Transport.
 */
export function makeNativeTransport(
  options: BaseNativeTransportOptions = {},
): NativeTransport {
  return new NativeTransport(options);
}

/**
 * Creates a Native Transport factory if the native transport is available.
 */
export function makeNativeTransportFactory({
  enableNative,
}: {
  enableNative?: boolean;
}): typeof makeNativeTransport | null {
  if (enableNative && NATIVE.isNativeClientAvailable()) {
    return makeNativeTransport;
  }
  return null;
}
