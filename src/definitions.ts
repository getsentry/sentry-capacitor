declare module '@capacitor/core' {
  interface PluginRegistry {
    SentryCapacitor: SentryCapacitorPlugin;
  }
}

export interface SentryCapacitorPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
