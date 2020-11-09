import { WebPlugin } from '@capacitor/core';
import { Integration } from '@sentry/types';

import { SentryCapacitorPlugin } from './definitions';

export class SentryCapacitorWeb extends WebPlugin implements SentryCapacitorPlugin {
  constructor() {
    super({
      name: 'SentryCapacitor',
      platforms: ['web'],
    });
  }

  async startWithOptions(options: {
    dsn: string;
    release: string;
    integrations: Integration[];
    tracesSampleRate: number;
  }): Promise<void> {
    // TODO integrate web
    console.log('options: ', options);
  }
}

const SentryCapacitor = new SentryCapacitorWeb();

export { SentryCapacitor };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(SentryCapacitor);
