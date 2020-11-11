import { WebPlugin } from '@capacitor/core';
import { CapacitorOptions } from './options';

import { SentryCapacitorPlugin } from './definitions';

export class SentryCapacitorWeb
  extends WebPlugin
  implements SentryCapacitorPlugin {
  constructor() {
    super({
      name: 'SentryCapacitor',
      platforms: ['web'],
    });
  }

  addBreadcrumb(): void {
    // TODO integrate web
  }

  clearBreadcrumbs(): void {
    // TODO integrate web
  }

  async fetchRelease(): Promise<{
    build: string;
    id: string;
    version: string;
  }> {
    // TODO integrate web
    return {
      build: 'somebuild',
      id: 'someid',
      version: 'someversion',
    };
  }

  nativeClientAvailable(): boolean {
    // TODO integrate web
    return false;
  }

  async startWithOptions(options: CapacitorOptions): Promise<boolean> {
    // TODO integrate web
    console.log('options: ', options);
    return true;
  }

  setUser(): void {
    // TODO integrate web
  }

  setTag(): void {
    // TODO integrate web
  }

  setExtra(): void {
    // TODO integrate web
  }

  setContext(): void {
    // TODO integrate web
  }

  setLogLevel(): void {
    // TODO integrate web
  }
}

const SentryCapacitor = new SentryCapacitorWeb();

export { SentryCapacitor };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(SentryCapacitor);
