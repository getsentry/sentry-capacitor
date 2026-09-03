const mockSpan = {};
const mockIsNativePlatform = jest.fn(() => true);

const mockRequest = jest.fn();
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: mockIsNativePlatform,
  },
  CapacitorHttp: {
    request: mockRequest,
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
  },
}));

jest.mock('@sentry/core', () => {
  const actual = jest.requireActual('@sentry/core');

  return {
    ...actual,
    addBreadcrumb: jest.fn(),
    getClient: jest.fn(),
    getTraceData: jest.fn(),
    setHttpStatus: jest.fn(),
    shouldPropagateTraceForUrl: jest.fn(),
    startSpan: jest.fn((_options, callback) => callback(mockSpan)),
  };
});

import { CapacitorHttp } from '@capacitor/core';
import {
  addBreadcrumb,
  getClient,
  getTraceData,
  setHttpStatus,
  shouldPropagateTraceForUrl,
  startSpan,
} from '@sentry/core';
import { capacitorHttpIntegration } from '../../src/integrations/capacitorHttp';

beforeAll(() => {
  capacitorHttpIntegration().setupOnce?.();
});

beforeEach(() => {
  jest.clearAllMocks();

  (getClient as jest.Mock).mockReturnValue({
    getOptions: () => ({
      tracePropagationTargets: ['example.com'],
      propagateTraceparent: true,
    }),
  });

  (shouldPropagateTraceForUrl as jest.Mock).mockReturnValue(true);

  (getTraceData as jest.Mock).mockReturnValue({
    'sentry-trace': 'trace-value',
    'baggage': 'sentry-release=1.0.0',
    'traceparent': 'traceparent-value',
  });
});

it('instruments a successful GET request', async () => {
  const response = {
    data: { success: true },
    headers: {
      'content-type': 'application/json',
    },
    status: 200,
    url: 'https://example.com/users',
  };

  mockGet.mockResolvedValue(response);

  const result = await CapacitorHttp.get({
    url: 'https://example.com/users?active=true',
  });

  expect(result).toBe(response);

  expect(startSpan).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'GET https://example.com/users',
      op: 'http.client',
      onlyIfParent: true,
    }),
    expect.any(Function),
  );

  expect(mockGet).toHaveBeenCalledWith({
    url: 'https://example.com/users?active=true',
    headers: {
      'sentry-trace': 'trace-value',
      'baggage': 'sentry-release=1.0.0',
      'traceparent': 'traceparent-value',
    },
  });

  expect(setHttpStatus).toHaveBeenCalledWith(mockSpan, 200);

  expect(addBreadcrumb).toHaveBeenCalledWith({
    category: 'capacitor.http',
    type: 'http',
    level: undefined,
    data: {
      method: 'GET',
      url: 'https://example.com/users?active=true',
      status_code: 200,
    },
  });
});

it('adds an error breadcrumb and preserves request rejection', async () => {
  const error = new Error('Network request failed');

  mockGet.mockRejectedValue(error);

  await expect(
    CapacitorHttp.get({
      url: 'https://example.com/users',
    }),
  ).rejects.toBe(error);

  expect(setHttpStatus).not.toHaveBeenCalled();

  expect(addBreadcrumb).toHaveBeenCalledWith({
    category: 'capacitor.http',
    type: 'http',
    level: 'error',
    data: {
      method: 'GET',
      url: 'https://example.com/users',
    },
  });
});

it('does not inject headers when the URL does not match', async () => {
  const response = {
    data: {},
    headers: {},
    status: 200,
    url: 'https://other.example/users',
  };

  const options = {
    url: 'https://other.example/users',
    headers: {
      authorization: 'Bearer token',
    },
  };

  mockGet.mockResolvedValue(response);
  (shouldPropagateTraceForUrl as jest.Mock).mockReturnValue(false);

  await CapacitorHttp.get(options);

  expect(shouldPropagateTraceForUrl).toHaveBeenCalledWith(options.url, [
    'example.com',
  ]);

  expect(getTraceData).not.toHaveBeenCalled();
  expect(mockGet).toHaveBeenCalledWith(options);

  expect(options).toEqual({
    url: 'https://other.example/users',
    headers: {
      authorization: 'Bearer token',
    },
  });
});

it('preserves existing trace headers and merges non-Sentry baggage', async () => {
  const response = {
    data: {},
    headers: {},
    status: 200,
    url: 'https://example.com/users',
  };

  const options = {
    url: 'https://example.com/users',
    headers: {
      'Sentry-Trace': 'existing-trace',
      'Traceparent': 'existing-traceparent',
      'Baggage': 'vendor=value',
    },
  };

  mockGet.mockResolvedValue(response);

  await CapacitorHttp.get(options);

  expect(getTraceData).toHaveBeenCalledWith({
    span: mockSpan,
    propagateTraceparent: true,
  });

  expect(mockGet).toHaveBeenCalledWith({
    url: 'https://example.com/users',
    headers: {
      'Sentry-Trace': 'existing-trace',
      'Traceparent': 'existing-traceparent',
      'Baggage': 'vendor=value,sentry-release=1.0.0',
    },
  });

  expect(options).toEqual({
    url: 'https://example.com/users',
    headers: {
      'Sentry-Trace': 'existing-trace',
      'Traceparent': 'existing-traceparent',
      'Baggage': 'vendor=value',
    },
  });
});

it('does not add traceparent when propagateTraceparent is disabled', async () => {
  const response = {
    data: {},
    headers: {},
    status: 200,
    url: 'https://example.com/users',
  };

  (getClient as jest.Mock).mockReturnValue({
    getOptions: () => ({
      tracePropagationTargets: ['example.com'],
      propagateTraceparent: false,
    }),
  });

  (getTraceData as jest.Mock).mockReturnValue({
    'sentry-trace': 'trace-value',
    'baggage': 'sentry-release=1.0.0',
  });

  mockGet.mockResolvedValue(response);

  await CapacitorHttp.get({
    url: 'https://example.com/users',
  });

  expect(getTraceData).toHaveBeenCalledWith({
    span: mockSpan,
    propagateTraceparent: false,
  });

  expect(mockGet).toHaveBeenCalledWith({
    url: 'https://example.com/users',
    headers: {
      'sentry-trace': 'trace-value',
      'baggage': 'sentry-release=1.0.0',
    },
  });
});

it.each([
  ['get', mockGet, 'GET', undefined],
  ['post', mockPost, 'POST', undefined],
  ['put', mockPut, 'PUT', undefined],
  ['patch', mockPatch, 'PATCH', undefined],
  ['delete', mockDelete, 'DELETE', undefined],
  ['request', mockRequest, 'GET', undefined],
  ['request', mockRequest, 'HEAD', 'head'],
] as const)(
  'instruments CapacitorHttp.%s using the %s method',
  async (method, originalMock, expectedMethod, requestMethod) => {
    const response = {
      data: {},
      headers: {},
      status: 200,
      url: 'https://example.com/users',
    };

    originalMock.mockResolvedValue(response);

    const options = {
      url: 'https://example.com/users',
      ...(requestMethod ? { method: requestMethod } : {}),
    };

    await CapacitorHttp[method](options);

    expect(startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: `${expectedMethod} https://example.com/users`,
        attributes: expect.objectContaining({
          'http.request.method': expectedMethod,
        }),
      }),
      expect.any(Function),
    );

    expect(originalMock).toHaveBeenCalled();
  },
);

it('passes the request through unchanged when there is no client', async () => {
  const response = {
    data: {},
    headers: {},
    status: 200,
    url: 'https://example.com/users',
  };

  const options = {
    url: 'https://example.com/users',
    headers: {
      authorization: 'Bearer token',
    },
  };

  (getClient as jest.Mock).mockReturnValue(undefined);
  mockGet.mockResolvedValue(response);

  const result = await CapacitorHttp.get(options);

  expect(result).toBe(response);
  expect(mockGet.mock.calls[0]?.[0]).toBe(options);

  expect(startSpan).not.toHaveBeenCalled();
  expect(shouldPropagateTraceForUrl).not.toHaveBeenCalled();
  expect(getTraceData).not.toHaveBeenCalled();
  expect(setHttpStatus).not.toHaveBeenCalled();
  expect(addBreadcrumb).not.toHaveBeenCalled();
});

it('preserves baggage that already contains Sentry values', async () => {
  const response = {
    data: {},
    headers: {},
    status: 200,
    url: 'https://example.com/users',
  };

  const options = {
    url: 'https://example.com/users',
    headers: {
      Baggage: 'vendor=value, sentry-release=existing',
    },
  };

  mockGet.mockResolvedValue(response);

  await CapacitorHttp.get(options);

  expect(mockGet).toHaveBeenCalledWith({
    url: 'https://example.com/users',
    headers: {
      'Baggage': 'vendor=value, sentry-release=existing',
      'sentry-trace': 'trace-value',
      'traceparent': 'traceparent-value',
    },
  });

  expect(options).toEqual({
    url: 'https://example.com/users',
    headers: {
      Baggage: 'vendor=value, sentry-release=existing',
    },
  });
});
