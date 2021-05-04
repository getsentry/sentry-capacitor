import { CapacitorBackend } from '../src/backend';

const EXAMPLE_DSN =
  'https://6890c2f6677340daa4804f8194804ea2@o19635.ingest.sentry.io/148053';

jest.mock(
  '@capacitor/core',
  () => ({
    Capacitor: {
      isPluginAvailable: jest.fn(() => true),
    },
    Plugins: {
      SentryCapacitor: {
        crash: jest.fn(),
        nativeTransportAvailable: true,
        startWithDsnString: jest.fn(dsn => {
          if (typeof dsn !== 'string') {
            throw new Error();
          }
          return Promise.resolve();
        }),
      },
    },
  }),
  /* virtual allows us to mock modules that aren't in package.json */
  { virtual: true },
);

describe('Tests CapacitorBackend', () => {
  describe('initializing the backend', () => {
    test('backend initializes', async () => {
      const backend = new CapacitorBackend({
        dsn: EXAMPLE_DSN,
        enableNative: true,
      });

      await expect(backend.eventFromMessage('test')).resolves.toBeDefined();
    });

    test('invalid dsn is thrown', () => {
      try {
        new CapacitorBackend({
          dsn: 'not a dsn',
          enableNative: true,
        });
      } catch (error) {
        expect(error.message).toBe('Invalid Dsn');
      }
    });

    test("undefined dsn doesn't crash", () => {
      expect(() => {
        const backend = new CapacitorBackend({
          dsn: undefined,
          enableNative: true,
        });

        return expect(backend.eventFromMessage('test')).resolves.toBeDefined();
      }).not.toThrow();
    });
  });

  describe('nativeCrash', () => {
    test('calls native crash', () => {
      const Capacitor = require('@capacitor/core');
      const backend = new CapacitorBackend({
        enableNative: true,
      });

      backend.nativeCrash();
      expect(Capacitor.Plugins.SentryCapacitor.crash).toBeCalled();
    });
  });
});
