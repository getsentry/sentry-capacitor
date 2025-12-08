/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { DsnComponents, LogEnvelope, MetricEnvelope, SdkMetadata, SerializedLog, SerializedMetric } from '@sentry/core';
import { createEnvelope, dsnToString } from '@sentry/core';
import type { LogContainerItem, MetricContainerItem } from '@sentry/core/build/types/types-hoist/envelope';


/**
 * Based on packages/core/src/metrics/envelope.ts
 * Creates a metric container envelope item for a list of metrics.
 *
 * @param items - The metrics to include in the envelope.
 * @returns The created metric container envelope item.
 */
export function createMetricContainerEnvelopeItem(items: Array<SerializedMetric>): MetricContainerItem {
  return [
    {
      type: 'trace_metric',
      item_count: items.length,
      content_type: 'application/vnd.sentry.items.trace-metric+json',
    } as MetricContainerItem[0],
    {
      items,
    },
  ];
}


/**
 * Based on getsentry/sentry-javascript/packages/core/src/logs/envelope.ts
 * Creates a log container envelope item for a list of logs.
 *
 * @param items - The logs to include in the envelope.
 * @returns The created log container envelope item.
 */
export function createLogContainerEnvelopeItem(items: Array<SerializedLog>): LogContainerItem {
  return [
    {
      type: 'log',
      item_count: items.length,
      content_type: 'application/vnd.sentry.items.log+json',
    },
    {
      items,
    },
  ];
}

/**
 * Based on getsentry/sentry-javascript/packages/core/src/logs/envelope.ts
 * Creates an envelope for a list of logs.
 *
 * Logs from multiple traces can be included in the same envelope.
 *
 * @param logs - The logs to include in the envelope.
 * @param metadata - The metadata to include in the envelope.
 * @param tunnel - The tunnel to include in the envelope.
 * @param dsn - The DSN to include in the envelope.
 * @returns The created envelope.
 */
export function createLogEnvelopeHelper(logs: Array<SerializedLog>,
  metadata?: SdkMetadata,
  tunnel?: string,
  dsn?: DsnComponents,
): LogEnvelope {
  const headers: LogEnvelope[0] = {};

  if (metadata?.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version,
    };
  }

  if (!!tunnel && !!dsn) {
    headers.dsn = dsnToString(dsn);
  }

  return createEnvelope<LogEnvelope>(headers, [createLogContainerEnvelopeItem(logs)]);
}

/**
 * Based on packages/core/src/metrics/envelope.ts
 * Creates an envelope for a list of metrics.
 *
 * Metrics from multiple traces can be included in the same envelope.
 *
 * @param metrics - The metrics to include in the envelope.
 * @param metadata - The metadata to include in the envelope.
 * @param tunnel - The tunnel to include in the envelope.
 * @param dsn - The DSN to include in the envelope.
 * @returns The created envelope.
 */
export function createMetricEnvelopeHelper(metrics: Array<SerializedMetric>,
  metadata?: SdkMetadata,
  tunnel?: string,
  dsn?: DsnComponents): MetricEnvelope {
    const headers: MetricEnvelope[0] = {};

    if (metadata?.sdk) {
      headers.sdk = {
        name: metadata.sdk.name,
        version: metadata.sdk.version,
      };
    }

    if (!!tunnel && !!dsn) {
      headers.dsn = dsnToString(dsn);
    }

    return createEnvelope<MetricEnvelope>(headers, [createMetricContainerEnvelopeItem(metrics)]);
}


export function base64EnvelopeToString(envelope: string): string | undefined {
  if (!envelope) {
    return undefined;
  }

  const decoded = Buffer.from(envelope, 'base64').toString('utf-8');
  return decoded;
}

