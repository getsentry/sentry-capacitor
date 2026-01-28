import { type NATIVE as ORIGINAL_NATIVE } from '../src/wrapper';
import type { MockInterface } from './testutils';

type NativeType = typeof ORIGINAL_NATIVE;

const NATIVE: MockInterface<NativeType> = {
  enableNative: true,
  platform: 'ios',

  _processItem: jest.fn(),
  _processLevels: jest.fn(),
  _processLevel: jest.fn(),
  _serializeObject: jest.fn(),

  initNativeSdk: jest.fn(),
  closeNativeSdk: jest.fn(),

  sendEnvelope: jest.fn(),

  fetchNativeRelease: jest.fn(),
  fetchNativeDeviceContexts: jest.fn(),
  fetchNativeLogAttributes: jest.fn(),
  fetchNativeSdkInfo: jest.fn(),

  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  clearBreadcrumbs: jest.fn(),
  setExtra: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),

  isModuleLoaded: jest.fn(),
  isNativeClientAvailable: jest.fn(),

  _DisabledNativeError: new Error('Native is disabled'),
  _NativeClientError: new Error(
    "Native Client is not available, can't start on native.",
  ),
  crash: jest.fn(),
};

NATIVE.isNativeClientAvailable.mockReturnValue(true);
NATIVE.initNativeSdk.mockResolvedValue(true);
NATIVE.fetchNativeRelease.mockResolvedValue({
  version: 'mock-native-version',
  build: 'mock-native-build',
  id: 'mock-native-id',
});
NATIVE.fetchNativeDeviceContexts.mockResolvedValue({});
NATIVE.fetchNativeLogAttributes.mockResolvedValue({});
NATIVE.fetchNativeSdkInfo.mockResolvedValue({ name: '', version: '' });

export const getCapSentryModule = jest.fn();

export { NATIVE };
