import { registerWebPlugin, WebPlugin } from '@capacitor/core';
import { Response, Status } from '@sentry/types';

import { SentryCapacitorPlugin } from './definitions';
import { CapacitorOptions } from './options';

/**
 *
 */
export class SentryCapacitorWeb
  extends WebPlugin
  implements SentryCapacitorPlugin {
  constructor() {
    super({
      name: 'SentryCapacitor',
      platforms: ['web'],
    });
  }

  /**
   *
   */
  addBreadcrumb(): void {
    // TODO integrate web
  }

  /**
   *
   */
  captureEnvelope(payload: { envelope: string }): Promise<Response> {
    // TODO integrate web
    /* eslint-disable-next-line no-console */
    console.log(payload.envelope);
    return Promise.resolve({
      status: Status.Success,
    });
  }

  /**
   *
   */
  clearBreadcrumbs(): void {
    // TODO integrate web
  }

  /**
   *
   */
  crash(): void {
    // TODO integrate web
  }

  /**
   *
   */
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

  /**
   *
   */
  getStringBytesLength(payload: {
    string: string;
  }): Promise<{ value: number }> {
    // TODO integrate web
    /* eslint-disable-next-line no-console */
    console.log(payload.string);
    return Promise.resolve({ value: 12 });
  }

  /**
   *
   */
  async startWithOptions(options: CapacitorOptions): Promise<boolean> {
    // TODO integrate web
    /* eslint-disable-next-line no-console */
    console.log(options);
    return true;
  }

  /**
   *
   */
  setUser(): void {
    // TODO integrate web
  }

  /**
   *
   */
  setTag(): void {
    // TODO integrate web
  }

  /**
   *
   */
  setExtra(): void {
    // TODO integrate web
  }

  /**
   *
   */
  setLogLevel(): void {
    // TODO integrate web
  }
}

const SentryCapacitor = new SentryCapacitorWeb();

export { SentryCapacitor };

registerWebPlugin(SentryCapacitor);
