import { NativeTransport } from '../../src/transports/native';

jest.mock('../../src/wrapper', () => ({
  NATIVE: {
    sendEvent: jest.fn(() => Promise.resolve({ status: 200 })),
  },
}));

describe('NativeTransport', () => {
  test('call native sendEvent', async () => {
    const transport = new NativeTransport();
    await expect(transport.sendEvent({})).resolves.toEqual({ status: 200 });
  });
});
