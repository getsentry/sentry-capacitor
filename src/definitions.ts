import { Integration } from '@sentry/types';

declare module '@capacitor/core' {
  interface PluginRegistry {
    SentryCapacitor: SentryCapacitorPlugin;
  }
}

export interface SentryCapacitorPlugin {
  startWithOptions(options: {
    dsn: string;
    release: string;
    integrations: Integration[];
    tracesSampleRate: number;
  }): void;
}
