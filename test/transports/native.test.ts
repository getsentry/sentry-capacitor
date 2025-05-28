import {
  BrowserClient,
  dedupeIntegration
} from '@sentry/browser';
import type { BrowserClientOptions } from '@sentry/browser/types/client';
import type { BrowserTransportOptions } from '@sentry/browser/types/transports/types';
import type { Event, Transport } from '@sentry/core';
import { NativeTransport } from '../../src/transports/native';
import { NATIVE } from '../../src/wrapper';

const EXAMPLE_DSN =
  'https://6890c2f6677340daa4804f8194804ea2@o19635.ingest.sentry.io/148053';

jest.mock('../../src/wrapper', () => ({
  NATIVE: {
    sendEnvelope: jest.fn(() => Promise.resolve({ status: 200 })),
  },
}));

describe('NativeTransport', () => {
  test('does not include sdkProcessingMetadata on event sent', async () => {
    const event = {
      event_id: 'event0',
      message: 'test©',
      sdk: {
        name: 'test-sdk-name',
        version: '1.2.3',
      },
      sdkProcessingMetadata: ['uneeeded data.', 'xz']
    };
    const captureEnvelopeSpy = jest.spyOn(NATIVE, 'sendEnvelope');

    const nativeTransport = new NativeTransport();
    const transport = (_options: BrowserTransportOptions): Transport => nativeTransport;

    const x = new BrowserClient(
      {
        transport: transport,
        enabled: true,
        integrations: [dedupeIntegration()], // It wont run if there are no integrations.
        dsn: EXAMPLE_DSN
      } as BrowserClientOptions);
    x.captureEvent(event);
    await x.flush();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NATIVE.sendEnvelope).toHaveBeenCalledTimes(1);

    const receivedEvent = captureEnvelopeSpy.mock.calls[0][0][1][0][1] as Event;

    expect(receivedEvent.event_id).toContain(event.event_id);
    expect(receivedEvent).not.toContain('sdkProcessingMetadata');
  });
});
