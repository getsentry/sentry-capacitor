import { registerPlugin } from '@capacitor/core';
import type { ISentryCapacitorPlugin } from './definitions';

const SentryCapacitor =
  registerPlugin<ISentryCapacitorPlugin>('SentryCapacitor');

export { SentryCapacitor };
