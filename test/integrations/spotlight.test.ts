import { spotlightBrowserIntegration } from '@sentry/browser';
import type { Client } from '@sentry/core';
import { spotlightIntegration } from '../../src/integrations/spotlight';
import { CAP_GLOBAL_OBJ } from '../../src/utils/webViewUrl';

jest.mock('@sentry/browser', () => ({
  spotlightBrowserIntegration: jest.fn(),
}));

describe('Spotlight Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the global object before each test
    delete CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL;
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

  it('should return integration with correct name', () => {
    const integration = spotlightIntegration(undefined);

    expect(integration.name).toBe('Spotlight');
  });

  it('should call spotlightBrowserIntegration when enableNative is false', () => {
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };
    const integration = spotlightIntegration(options);

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({ enableNative: false }),
    } as any;

    integration.setup!(mockClient);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith(options);
    expect(spotlightBrowserIntegration).toHaveBeenCalledTimes(1);
  });

  it('should call spotlightBrowserIntegration when enableNative is undefined', () => {
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };
    const integration = spotlightIntegration(options);

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({}),
    } as any;

    integration.setup!(mockClient);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith(options);
    expect(spotlightBrowserIntegration).toHaveBeenCalledTimes(1);
  });

  it('should not call spotlightBrowserIntegration when enableNative is true', () => {
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };
    const integration = spotlightIntegration(options);

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({ enableNative: true }),
    } as any;

    integration.setup!(mockClient);

    expect(spotlightBrowserIntegration).not.toHaveBeenCalled();
  });

  it('should cache sidecarUrl before setup is called', () => {
    const sidecarUrl = 'http://192.168.8.150:8969/stream';
    const options = { sidecarUrl };

    const integration = spotlightIntegration(options);

    // Verify it's cached immediately, before setup
    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBe(sidecarUrl);

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({ enableNative: true }),
    } as any;

    integration.setup!(mockClient);

    // Verify it's still cached after setup
    expect(CAP_GLOBAL_OBJ.CAP_SPOTLIGHT_URL).toBe(sidecarUrl);
  });

  it('should pass undefined options to spotlightBrowserIntegration when options are undefined', () => {
    const integration = spotlightIntegration(undefined);

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({ enableNative: false }),
    } as any;

    integration.setup!(mockClient);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith(undefined);
  });

  it('should pass empty options to spotlightBrowserIntegration when options are empty', () => {
    const integration = spotlightIntegration({});

    const mockClient: jest.Mocked<Client> = {
      getOptions: jest.fn().mockReturnValue({ enableNative: false }),
    } as any;

    integration.setup!(mockClient);

    expect(spotlightBrowserIntegration).toHaveBeenCalledWith({});
  });
});

