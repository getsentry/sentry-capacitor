import type { Breadcrumb, Package } from '@sentry/types';

import type { CapacitorOptions } from './options';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface serializedObject {
  [key: string]: string;
}

export type NativeDeviceContextsResponse = {
  [key: string]: Record<string, unknown>;
};

export interface ISentryCapacitorPlugin {
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  captureEnvelope(payload: { envelope: number[] }
  ): PromiseLike<boolean>;

  clearBreadcrumbs(): void;
  crash(): void;
  fetchNativeRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }>;
  fetchNativeSdkInfo(): Promise<Package>;
  fetchNativeDeviceContexts(): PromiseLike<NativeDeviceContextsResponse>;
  getStringBytesLength(payload: { string: string }): Promise<{ value: number }>;
  initNativeSdk(payload: { options: CapacitorOptions }): Promise<boolean>;
  setUser(payload: {
    defaultUserKeys: serializedObject | null;
    otherUserKeys: serializedObject | null;
  }): void;
  setTag(payload: { key: string; value: string }): void;
  setExtra(payload: { key: string; value: string }): void;
  setContext(payload: { key: string; value: serializedObject | null }): void;
}
