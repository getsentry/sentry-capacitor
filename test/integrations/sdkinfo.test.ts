import type { Event, EventHint, Package } from '@sentry/core';

import { SDK_NAME, SDK_VERSION } from '../../src/';
import { sdkInfoIntegration } from '../../src/integrations';
import { NATIVE } from '../../src/wrapper';

let mockedFetchNativeSdkInfo: jest.Mock<PromiseLike<Package | null>, []>;

const mockiOSPackage = {
  name: 'sentry-cocoa',
  version: '0.0.1',
};

const mockDroidPackage = {
  name: 'sentry-android',
  version: '0.0.1',
};

jest.mock('../../src/wrapper', () => {
  const actual = jest.requireActual('../../src/wrapper');

  return {
    NATIVE: {
      ...actual.NATIVE,
      platform: 'ios',
      fetchNativeSdkInfo: () => mockedFetchNativeSdkInfo(),
    },
  };
});


describe('Sdk Info', () => {
  afterEach(() => {
    NATIVE.platform = 'ios';
  });

  it('Adds native package and javascript platform to event on iOS', async () => {
    mockedFetchNativeSdkInfo = jest.fn().mockResolvedValue(mockiOSPackage);
    const mockEvent: Event = {};
    const processedEvent = await processEvent(mockEvent);

    expect(processedEvent?.sdk?.packages).toEqual(expect.arrayContaining([mockiOSPackage]));
    expect(processedEvent?.platform === 'javascript');
    expect(mockedFetchNativeSdkInfo).toHaveBeenCalledTimes(1);
  });

  it('Adds javascript platform but not native package on Android', async () => {
    NATIVE.platform = 'android';
    mockedFetchNativeSdkInfo = jest.fn().mockResolvedValue(mockDroidPackage);
    const mockEvent: Event = {};
    const processedEvent = await processEvent(mockEvent);

    expect(processedEvent?.sdk?.packages).toEqual(expect.not.arrayContaining([mockDroidPackage]));
    expect(processedEvent?.platform === 'javascript');
    expect(mockedFetchNativeSdkInfo).not.toHaveBeenCalled();
  });

  it('Does not overwrite existing sdk name and version', async () => {
    mockedFetchNativeSdkInfo = jest.fn().mockResolvedValue(null);
    const mockEvent: Event = {
      sdk: {
        name: 'test-sdk',
        version: '1.0.0',
      },
    };
    const processedEvent = await processEvent(mockEvent);

    expect(processedEvent?.sdk?.name).toEqual('test-sdk');
    expect(processedEvent?.sdk?.version).toEqual('1.0.0');
  });

  it('Does use default sdk name and version', async () => {
    mockedFetchNativeSdkInfo = jest.fn().mockResolvedValue(null);
    const mockEvent: Event = {};
    const processedEvent = await processEvent(mockEvent);

    expect(processedEvent?.sdk?.name).toEqual(SDK_NAME);
    expect(processedEvent?.sdk?.version).toEqual(SDK_VERSION);
  });
});

function processEvent(mockedEvent: Event, mockedHint: EventHint = {}): Event | null | PromiseLike<Event | null> {
  const integration = sdkInfoIntegration();
  return integration.processEvent!(mockedEvent, mockedHint, {} as any);
}
