jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
  CapacitorHttp: {
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { capacitorHttpIntegration } from '../../src/integrations/capacitorHttp';

it('does not instrument CapacitorHttp on web platforms', () => {
  const originalMethods = {
    request: CapacitorHttp.request,
    get: CapacitorHttp.get,
    post: CapacitorHttp.post,
    put: CapacitorHttp.put,
    patch: CapacitorHttp.patch,
    delete: CapacitorHttp.delete,
  };

  capacitorHttpIntegration().setupOnce?.();

  expect(Capacitor.isNativePlatform).toHaveBeenCalledTimes(1);
  expect(CapacitorHttp.request).toBe(originalMethods.request);
  expect(CapacitorHttp.get).toBe(originalMethods.get);
  expect(CapacitorHttp.post).toBe(originalMethods.post);
  expect(CapacitorHttp.put).toBe(originalMethods.put);
  expect(CapacitorHttp.patch).toBe(originalMethods.patch);
  expect(CapacitorHttp.delete).toBe(originalMethods.delete);
});
