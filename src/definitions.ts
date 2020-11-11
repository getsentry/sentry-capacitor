import { Breadcrumb } from '@sentry/types';

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
  clearBreadcrumbs(): void;
  fetchRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }>;
  nativeClientAvailable(): boolean;
  startWithOptions(options: CapacitorOptions): Promise<boolean>;
  setUser(
    user: serializedObject | null,
    otherUserKeys: serializedObject | null,
  ): void;
  setTag(key: string, value: string): void;
  setExtra(key: string, value: string): void;
  setContext(key: string, context: serializedObject | null): void;
  setLogLevel(level: number): void;
}
