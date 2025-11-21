import { spotlightBrowserIntegration } from '@sentry/browser';
import { spotlightIntegration } from '../../src/integrations/spotlight';
import { CAP_GLOBAL_OBJ } from '../../src/utils/webViewUrl';
import { NATIVE } from '../../src/wrapper';

const mockBrowserIntegration = { name: 'SpotlightBrowser' };

jest.mock('@sentry/browser', () => {
  const mockIntegration = { name: 'SpotlightBrowser' };
  return {
    spotlightBrowserIntegration: jest.fn(() => mockIntegration),
  };
});

jest.mock('../../src/wrapper', () => {
  const actual = jest.requireActual('../../src/wrapper');
  return {
    NATIVE: {
      ...actual.NATIVE,
      platform: 'ios',
    },
  };
});

describe('Spotlight Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the global object before each test
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
    // Reset platform to default
    NATIVE.platform = 'ios';
  });

  afterEach(() => {
    // Clean up the global object after each test
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
  });

  it('should cache sidecarUrl in CAP_GLOBAL_OBJ when provided', () => {
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    spotlightIntegration(options);

    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBe(sidecarUrl);
  });

  it('should not set CAP_SPOTLIGHT_URL when sidecarUrl is not provided', () => {
    spotlightIntegration(undefined);

    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBeUndefined();
  });

  it('should not set CAP_SPOTLIGHT_URL when sidecarUrl is empty', () => {
    const options = { sidecarUrl: '' };

    spotlightIntegration(options);

    // Empty string is falsy, so it won't be set
    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBeUndefined();
  });

  it('should return integration with correct name when platform is not web', () => {
    NATIVE.platform = 'ios';
    const integration = spotlightIntegration(undefined);

    expect(integration.name).toBe('Spotlight');
    expect(spotlightBrowserIntegration).not.toHaveBeenCalled();
  });

  it('should return spotlightBrowserIntegration when platform is web', () => {
    NATIVE.platform = 'web';
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    const integration = spotlightIntegration(options);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith(options);
    expect(spotlightBrowserIntegration).toHaveBeenCalledTimes(1);
    expect(integration).toEqual(mockBrowserIntegration);
  });

  it('should return spotlightBrowserIntegration when platform is web with undefined options', () => {
    NATIVE.platform = 'web';

    const integration = spotlightIntegration(undefined);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith(undefined);
    expect(spotlightBrowserIntegration).toHaveBeenCalledTimes(1);
    expect(integration).toEqual(mockBrowserIntegration);
  });

  it('should return spotlightBrowserIntegration when platform is web with empty options', () => {
    NATIVE.platform = 'web';

    const integration = spotlightIntegration({});

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith({});
    expect(spotlightBrowserIntegration).toHaveBeenCalledTimes(1);
    expect(integration).toEqual(mockBrowserIntegration);
  });

  it('should return simple integration object when platform is ios', () => {
    NATIVE.platform = 'ios';
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    const integration = spotlightIntegration(options);

    expect(integration).toEqual({ name: 'Spotlight' });
    expect(spotlightBrowserIntegration).not.toHaveBeenCalled();
  });

  it('should return simple integration object when platform is android', () => {
    NATIVE.platform = 'android';
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    const integration = spotlightIntegration(options);

    expect(integration).toEqual({ name: 'Spotlight' });
    expect(spotlightBrowserIntegration).not.toHaveBeenCalled();
  });

  it('should cache sidecarUrl regardless of platform', () => {
    NATIVE.platform = 'ios';
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    spotlightIntegration(options);

    // Verify it's cached
    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBe(sidecarUrl);
  });

  it('should cache sidecarUrl on web platform', () => {
    NATIVE.platform = 'web';
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    spotlightIntegration(options);

    // Verify it's cached even on web platform
    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBe(sidecarUrl);
  });
});

