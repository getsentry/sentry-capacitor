import {
  Capacitor,
  type HttpOptions,
  type HttpResponse,
} from '@capacitor/core';
import {
  addBreadcrumb,
  getBreadcrumbLogLevelFromHttpStatusCode,
  getClient,
  getTraceData,
  type Integration,
  setHttpStatus,
  shouldPropagateTraceForUrl,
  type Span,
  startSpan,
  stripUrlQueryAndFragment,
} from '@sentry/core';
import { fillTyped } from '../utils/fill';

const INTEGRATION_NAME = 'CapacitorHttp';

type HttpMethod = 'request' | 'get' | 'post' | 'put' | 'patch' | 'delete';

type NativePromise = (
  pluginName: string,
  methodName: string,
  options?: unknown,
) => Promise<unknown>;

type CapacitorWithNativePromise = typeof Capacitor & {
  nativePromise: NativePromise;
};

const HTTP_METHODS: HttpMethod[] = [
  'request',
  'get',
  'post',
  'put',
  'patch',
  'delete',
];

function isHttpMethod(method: string): method is HttpMethod {
  return HTTP_METHODS.includes(method as HttpMethod);
}

function isHttpOptions(options: unknown): options is HttpOptions {
  return (
    typeof options === 'object' &&
    options !== null &&
    'url' in options &&
    typeof options.url === 'string'
  );
}

export const capacitorHttpIntegration = (): Integration => ({
  name: INTEGRATION_NAME,

  setupOnce(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const capacitor = Capacitor as CapacitorWithNativePromise;

    if (typeof capacitor.nativePromise !== 'function') {
      return;
    }

    fillTyped(capacitor, 'nativePromise', original => {
      return function (
        this: CapacitorWithNativePromise,
        pluginName: string,
        methodName: string,
        options?: unknown,
      ): Promise<unknown> {
        if (
          pluginName !== INTEGRATION_NAME ||
          !isHttpMethod(methodName) ||
          !isHttpOptions(options)
        ) {
          return original.call(this, pluginName, methodName, options);
        }

        const nativeRequest = (
          requestOptions: HttpOptions,
        ): Promise<HttpResponse> =>
          original.call(
            this,
            pluginName,
            methodName,
            requestOptions,
          ) as Promise<HttpResponse>;

        return instrumentRequest(nativeRequest, this, methodName, options);
      };
    });
  },
});

function getMethod(method: HttpMethod, options: HttpOptions): string {
  return method === 'request'
    ? (options.method ?? 'GET').toUpperCase()
    : method.toUpperCase();
}

function addTracingHeaders(options: HttpOptions, span: Span): HttpOptions {
  const client = getClient();

  if (!client) {
    return options;
  }
  const { tracePropagationTargets, propagateTraceparent } = client.getOptions();
  if (!shouldPropagateTraceForUrl(options.url, tracePropagationTargets)) {
    return options;
  }

  const traceData = getTraceData({
    span,
    propagateTraceparent,
  });

  const headers = { ...options.headers };

  setHeaderIfMissing(headers, 'sentry-trace', traceData['sentry-trace']);
  setHeaderIfMissing(headers, 'traceparent', traceData.traceparent);
  mergeBaggageHeader(headers, traceData.baggage);

  return {
    ...options,
    headers,
  };
}

function findHeaderKey(
  headers: Record<string, string>,
  name: string,
): string | undefined {
  return Object.keys(headers).find(
    key => key.toLowerCase() === name.toLowerCase(),
  );
}

function setHeaderIfMissing(
  headers: Record<string, string>,
  name: string,
  value: string | undefined,
): void {
  if (!value || findHeaderKey(headers, name)) {
    return;
  }

  headers[name] = value;
}

function mergeBaggageHeader(
  headers: Record<string, string>,
  sentryBaggage: string | undefined,
): void {
  if (!sentryBaggage) {
    return;
  }

  const existingKey = findHeaderKey(headers, 'baggage');

  if (!existingKey) {
    headers.baggage = sentryBaggage;
    return;
  }

  const existingValue = headers[existingKey];

  if (!existingValue) {
    headers[existingKey] = sentryBaggage;
    return;
  }

  // Preserve baggage which already contains Sentry Values
  if (/(?:^|,)\s*sentry-[^=]*=/.test(existingValue)) {
    return;
  }

  headers[existingKey] = `${existingValue},${sentryBaggage}`;
}

async function instrumentRequest(
  original: (this: unknown, options: HttpOptions) => Promise<HttpResponse>,
  thisArg: unknown,
  methodName: HttpMethod,
  options: HttpOptions,
): Promise<HttpResponse> {
  const client = getClient();

  if (!client) {
    return original.call(thisArg, options);
  }

  const method = getMethod(methodName, options);
  const spanName = `${method} ${stripUrlQueryAndFragment(options.url)}`;

  return startSpan(
    {
      name: spanName,
      op: 'http.client',
      onlyIfParent: true,
      attributes: {
        'http.request.method': method,
        'url.full': options.url,
        'sentry.origin': 'auto.http.capacitor',
      },
    },
    async span => {
      // Trace headers, request, status and breadcrumb
      const requestOptions = addTracingHeaders(options, span);

      try {
        const response = (await original.call(
          thisArg,
          requestOptions,
        )) as HttpResponse;

        setHttpStatus(span, response.status);

        addBreadcrumb({
          category: 'capacitor.http',
          type: 'http',
          level: getBreadcrumbLogLevelFromHttpStatusCode(response.status),
          data: {
            method,
            url: options.url,
            status_code: response.status,
          },
        });

        return response;
      } catch (error) {
        addBreadcrumb({
          category: 'capacitor.http',
          type: 'http',
          level: 'error',
          data: {
            method,
            url: options.url,
          },
        });

        throw error;
      }
    },
  );
}
