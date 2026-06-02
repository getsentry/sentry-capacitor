jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: jest.fn(() => 'android'),
  },
}));

jest.mock('../src/plugin', () => ({
  SentryCapacitor: {
    addListener: jest.fn(),
  },
}));

jest.mock('@sentry/core', () => ({
  debug: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { Capacitor } from '@capacitor/core';
import { debug } from '@sentry/core';
import { defaultNativeLogHandler, setupNativeLogListener, stopNativeLogListener } from '../src/NativeLogListener';
import { SentryCapacitor } from '../src/plugin';

const mockGetPlatform = Capacitor.getPlatform as jest.Mock;
const mockAddListener = SentryCapacitor.addListener as jest.Mock;

function makeListenerHandle(removeFn = jest.fn()) {
  return { remove: removeFn };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPlatform.mockReturnValue('android');
  // Reset module-level _removeListener between tests by stopping any active listener
  stopNativeLogListener();
});

describe('setupNativeLogListener', () => {
  it('registers a listener on android', async () => {
    const handle = makeListenerHandle();
    mockAddListener.mockResolvedValue(handle);
    const callback = jest.fn();

    setupNativeLogListener(callback);
    await Promise.resolve();

    expect(mockAddListener).toHaveBeenCalledWith('SentryNativeLog', callback);
    expect(debug.log).toHaveBeenCalledWith('Native log listener set up successfully.');
  });

  it('registers a listener on ios', async () => {
    mockGetPlatform.mockReturnValue('ios');
    const handle = makeListenerHandle();
    mockAddListener.mockResolvedValue(handle);
    const callback = jest.fn();

    setupNativeLogListener(callback);
    await Promise.resolve();

    expect(mockAddListener).toHaveBeenCalledWith('SentryNativeLog', callback);
  });

  it('does not register on web', () => {
    mockGetPlatform.mockReturnValue('web');
    const callback = jest.fn();

    setupNativeLogListener(callback);

    expect(mockAddListener).not.toHaveBeenCalled();
    expect(debug.log).toHaveBeenCalledWith('Native log listener is only supported on iOS and Android.');
  });

  it('does not register a second listener if already active', async () => {
    const handle = makeListenerHandle();
    mockAddListener.mockResolvedValue(handle);
    const callback = jest.fn();

    setupNativeLogListener(callback);
    await Promise.resolve();
    setupNativeLogListener(callback);
    await Promise.resolve();

    expect(mockAddListener).toHaveBeenCalledTimes(1);
  });

  it('logs a warning and clears state when addListener rejects', async () => {
    const error = new Error('plugin error');
    mockAddListener.mockRejectedValue(error);
    const callback = jest.fn();

    setupNativeLogListener(callback);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(debug.warn).toHaveBeenCalledWith('Failed to set up native log listener:', error);
    // After failure a second call should attempt registration again
    mockAddListener.mockResolvedValue(makeListenerHandle());
    setupNativeLogListener(callback);
    await Promise.resolve();
    expect(mockAddListener).toHaveBeenCalledTimes(2);
  });
});

describe('stopNativeLogListener', () => {
  it('removes the listener handle', async () => {
    const removeFn = jest.fn().mockResolvedValue(undefined);
    mockAddListener.mockResolvedValue(makeListenerHandle(removeFn));

    setupNativeLogListener(jest.fn());
    await Promise.resolve();

    stopNativeLogListener();
    expect(removeFn).toHaveBeenCalled();
  });

  it('is a no-op when no listener is registered', () => {
    expect(() => stopNativeLogListener()).not.toThrow();
  });

  it('allows a new listener to be registered after stopping', async () => {
    const handle = makeListenerHandle();
    mockAddListener.mockResolvedValue(handle);

    setupNativeLogListener(jest.fn());
    await Promise.resolve();
    stopNativeLogListener();

    mockAddListener.mockResolvedValue(makeListenerHandle());
    setupNativeLogListener(jest.fn());
    await Promise.resolve();

    expect(mockAddListener).toHaveBeenCalledTimes(2);
  });

  it('removes the handle immediately when stop is called before addListener resolves', async () => {
    const removeFn = jest.fn().mockResolvedValue(undefined);
    let resolveAddListener!: (v: unknown) => void;
    mockAddListener.mockReturnValue(new Promise(r => { resolveAddListener = r; }));

    setupNativeLogListener(jest.fn());
    // Stop before the promise resolves
    stopNativeLogListener();

    // Now let addListener resolve — the handle should be removed immediately
    resolveAddListener(makeListenerHandle(removeFn));
    await Promise.resolve();

    expect(removeFn).toHaveBeenCalled();
  });
});

describe('defaultNativeLogHandler', () => {
  it.each([
    ['fatal', 'error'],
    ['error', 'error'],
    ['warning', 'warn'],
    ['info', 'log'],
    ['debug', 'log'],
    ['unknown', 'log'],
  ])('routes level "%s" to debug.%s', (level, method) => {
    defaultNativeLogHandler({ level, component: 'Transport', message: 'test msg' });
    expect((debug as any)[method]).toHaveBeenCalledWith('[Native] [Transport] test msg');
  });

  it('is case-insensitive for level matching', () => {
    defaultNativeLogHandler({ level: 'ERROR', component: 'Core', message: 'oops' });
    expect(debug.error).toHaveBeenCalledWith('[Native] [Core] oops');
  });

  it('formats the message with component and message', () => {
    defaultNativeLogHandler({ level: 'info', component: 'MyComp', message: 'hello world' });
    expect(debug.log).toHaveBeenCalledWith('[Native] [MyComp] hello world');
  });
});
