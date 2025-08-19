// Shared mock for @capacitor/core to avoid conflicts between test files
export const mockCapacitor = {
  WebPlugin: jest.fn(),
  registerPlugin: jest.fn(),
  Capacitor: {
    isPluginAvailable: jest.fn(() => true),
    getPlatform: jest.fn(() => 'android'),
  },
};

export const setupCapacitorMock = () => {
  jest.doMock('@capacitor/core', () => mockCapacitor);
};
