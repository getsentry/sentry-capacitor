import { addGlobalEventProcessor, getCurrentHub } from '@sentry/core';
import type { Event, Integration } from '@sentry/types';

import { NATIVE } from '../wrapper';

/** Release integration responsible to load release from file. */
export class Release implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = 'Release';
  /**
   * @inheritDoc
   */
  public name: string = Release.id;

  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    addGlobalEventProcessor(async (event: Event) => {
      const self = getCurrentHub().getIntegration(Release);
      if (!self) {
        return event;
      }

      const options = getCurrentHub().getClient()?.getOptions();

      /*
        Check for the release and dist in the options passed on init.
        Otherwise, we get the release and dist from the native package.
      */
      if (typeof options?.release === 'string') {
        event.release = options.release;
      }

      if (typeof options?.dist === 'string') {
        event.dist = options.dist;
      }

      if (event.release && event.dist) {
        return event;
      }

      try {
        const nativeRelease = await NATIVE.fetchNativeRelease();
        if (nativeRelease) {
          if (!event.release) {
            event.release = `${nativeRelease.id}@${nativeRelease.version}+${nativeRelease.build}`;
          }
          if (!event.dist) {
            event.dist = `${nativeRelease.build}`;
          }
        }
      } catch (_Oo) {
        // Something went wrong, we just continue
      }

      return event;
    });
  }
}
