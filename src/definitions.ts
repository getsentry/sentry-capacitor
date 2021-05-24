import { Breadcrumb, Response } from '@sentry/types';

import { CapacitorOptions } from './options';

declare module '@capacitor/core' {
  interface PluginRegistry {
    SentryCapacitor: SentryCapacitorPlugin;
  }
}

interface serializedObject {
  [key: string]: string;
}

export interface SentryCapacitorPlugin {
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  captureEnvelope(payload: { envelope: string }): PromiseLike<Response>;
  clearBreadcrumbs(): void;
  crash(): void;
  fetchRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }>;
  getStringBytesLength(payload: { string: string }): Promise<{ value: number }>;
  startWithOptions(options: CapacitorOptions): Promise<boolean>;
  setUser(
    user: serializedObject | null,
    otherUserKeys: serializedObject | null,
  ): void;
  setTag(key: string, value: string): void;
  setExtra(key: string, value: string): void;
}
