import { registerPlugin } from '@capacitor/core';

import { ISentryCapacitorPlugin } from './definitions';
import { SentryCapacitorWeb } from './web';

const SentryCapacitor = registerPlugin<ISentryCapacitorPlugin>(
  'SentryCapacitor',
  () => ({
    web: new SentryCapacitorWeb(),
  }),
);

export { SentryCapacitor };
