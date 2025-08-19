import { Capacitor } from '@capacitor/core';

// Must be imported after the line that mocks Capacitor.
export function expectPlatformWithReturn(platform: string) {
  const mockGetPlatform = Capacitor.getPlatform as jest.Mock;
  expect(mockGetPlatform).toHaveBeenCalled();
  expect(mockGetPlatform).toHaveReturnedWith(platform);
}
