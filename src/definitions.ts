import { CapacitorOptions } from './options';

declare module '@capacitor/core' {
  interface PluginRegistry {
    SentryCapacitor: SentryCapacitorPlugin;
  }
}

export interface SentryCapacitorPlugin {
  startWithOptions(options: CapacitorOptions): boolean;
}
