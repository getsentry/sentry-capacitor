import { WebPlugin } from '@capacitor/core';
import { SentryCapacitorPlugin } from './definitions';

export class SentryCapacitorWeb extends WebPlugin implements SentryCapacitorPlugin {
  constructor() {
    super({
      name: 'SentryCapacitor',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const SentryCapacitor = new SentryCapacitorWeb();

export { SentryCapacitor };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(SentryCapacitor);
