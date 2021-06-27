import { Breadcrumb, Response } from '@sentry/types';

import { CapacitorOptions } from './options';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface serializedObject {
  [key: string]: string;
}

export interface ISentryCapacitorPlugin {
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  captureEnvelope(payload: {
    envelope:
      | string
      | {
          header: Record<string, unknown>;
          item: Record<string, unknown>;
          payload: Record<string, unknown>;
        };
  }): PromiseLike<Response>;
  clearBreadcrumbs(): void;
  crash(): void;
  fetchRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }>;
  getStringBytesLength(payload: { string: string }): Promise<{ value: number }>;
  initNativeSdk(payload: { options: CapacitorOptions }): Promise<boolean>;
  setUser(
    user: serializedObject | null,
    otherUserKeys: serializedObject | null,
  ): void;
  setTag(key: string, value: string): void;
  setExtra(key: string, value: string): void;
}
