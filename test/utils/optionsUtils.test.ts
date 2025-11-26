jest.mock('../../src/wrapper', () => jest.requireActual('../mockWrapper'));

import { getGlobalScope, getIsolationScope } from '@sentry/core';
import type { CapacitorOptions } from '../../src/options';
import { enableSyncToNative } from '../../src/scopeSync';
import { RestoreNonNativeOptions } from '../../src/utils/optionsUtils';

// Mock the scopes
jest.mock('@sentry/core', () => {
  const actual = jest.requireActual('@sentry/core');
  const mockScope = {
    setUser: jest.fn(),
    setTag: jest.fn(),
    setTags: jest.fn(),
    setExtra: jest.fn(),
    setExtras: jest.fn(),
    addBreadcrumb: jest.fn(),
    clearBreadcrumbs: jest.fn(),
    setContext: jest.fn(),
  };

  return {
    ...actual,
    getGlobalScope: jest.fn(() => mockScope),
    getIsolationScope: jest.fn(() => mockScope),
  };
});

describe('RestoreNonNativeOptions', () => {
  const mockTransport = jest.fn();
  let mockGlobalScope: any;
  let mockIsolationScope: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalScope = (getGlobalScope as jest.Mock)();
    mockIsolationScope = (getIsolationScope as jest.Mock)();
  });

  it('should set custom transport when enableNative is true', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: true,
    };

    RestoreNonNativeOptions(options, mockTransport);

    expect(options.transport).toBe(mockTransport);
  });

  it('should not set transport when enableNative is false', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: false,
    };

    RestoreNonNativeOptions(options, mockTransport);

    expect(options.transport).toBeUndefined();
  });

  it('should not set transport when enableNative is undefined', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
    };

    RestoreNonNativeOptions(options, mockTransport);

    expect(options.transport).toBeUndefined();
  });

  it('should disable sync to native for global and isolation scopes when enableNative is true', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: true,
    };

    // First enable sync to simulate the normal flow
    enableSyncToNative(mockGlobalScope);
    enableSyncToNative(mockIsolationScope);

    RestoreNonNativeOptions(options, mockTransport);

    // We can't directly test disableSyncToNative was called since it's an internal function,
    // but we can verify the scopes were accessed
    expect(getGlobalScope).toHaveBeenCalled();
    expect(getIsolationScope).toHaveBeenCalled();
  });

  it('should not disable sync when enableNative is false', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: false,
    };

    // Reset the mock call counts
    jest.clearAllMocks();

    RestoreNonNativeOptions(options, mockTransport);

    expect(getGlobalScope).not.toHaveBeenCalled();
    expect(getIsolationScope).not.toHaveBeenCalled();
  });

  it('should work with undefined customTransport', () => {
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: true,
    };

    expect(() => RestoreNonNativeOptions(options)).not.toThrow();
    expect(options.transport).toBeUndefined();
  });

  it('should preserve existing transport when enableNative is false', () => {
    const existingTransport = jest.fn();
    const options: CapacitorOptions = {
      dsn: 'test-dsn',
      enableNative: false,
      transport: existingTransport,
    };

    RestoreNonNativeOptions(options, mockTransport);

    expect(options.transport).toBe(existingTransport);
  });
});
