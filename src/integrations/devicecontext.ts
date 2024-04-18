import type { Breadcrumb, Event, EventProcessor, Hub, Integration } from '@sentry/types';
import { logger, severityLevelFromString } from '@sentry/utils';
import type { NativeDeviceContextsResponse } from 'src/definitions';

import { breadcrumbFromObject } from '../breadcrumb';
import { NATIVE } from '../wrapper';

/** Load device context from native. */
export class DeviceContext implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = 'DeviceContext';

  /**
   * @inheritDoc
   */
  public name: string = DeviceContext.id;

  /**
   * @inheritDoc
   */
  public setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void {
    // eslint-disable-next-line complexity
    addGlobalEventProcessor(async (event: Event) => {
      const self = getCurrentHub().getIntegration(DeviceContext);
      if (!self) {
        return event;
      }

      let nativeContexts: NativeDeviceContextsResponse | null = null;
      try {
        nativeContexts = await NATIVE.fetchNativeDeviceContexts();
      } catch (e) {
        logger.log(`Failed to get device context from native: ${e}`);
      }
      if (!nativeContexts) {
        return event;
      }

      if (nativeContexts.contexts) {
        event.contexts = { ...nativeContexts.contexts, ...event.contexts };
        if (nativeContexts.contexts.app) {
          event.contexts.app = { ...nativeContexts.contexts.app, ...event.contexts.app };
        }
      }
      if (nativeContexts.user) {
        const user = nativeContexts.user;
        if (!event.user) {
          event.user = { ...user };
        }
      }
      const nativeTags = nativeContexts.tags;
      if (nativeTags) {
        event.tags = { ...nativeTags, ...event.tags };
      }

      const nativeExtra = nativeContexts.extra;
      if (nativeExtra) {
        event.extra = { ...nativeExtra, ...event.extra };
      }

      const nativeFingerprint = nativeContexts.fingerprint;
      if (nativeFingerprint) {
        event.fingerprint = (event.fingerprint ?? []).concat(
          nativeFingerprint.filter(item => (event.fingerprint ?? []).indexOf(item) < 0),
        );
      }

      if (!event.level && nativeContexts.level) {
        event.level = severityLevelFromString(nativeContexts.level);
      }

      const nativeEnvironment = nativeContexts.environment;
      if (!event.environment && nativeEnvironment) {
        event.environment = nativeEnvironment;
      }

      const nativeBreadcrumbs = Array.isArray(nativeContexts.breadcrumbs)
      ? nativeContexts.breadcrumbs.map(breadcrumbFromObject)
      : undefined;
      if (nativeBreadcrumbs) {
        if (event.breadcrumbs && event.breadcrumbs.length !== nativeBreadcrumbs.length) {
          event.breadcrumbs = this._mergeUniqueBreadcrumbs(event.breadcrumbs, nativeBreadcrumbs);
        }
        else {
          event.breadcrumbs = nativeBreadcrumbs;
        }
      }

      return event;
    });
  }

  /**
 * Merges two groups of ordered breadcrumbs and removes any duplication that may
 * happen between them.
 * @param jsList The first group of breadcrumbs from the JavaScript layer.
 * @param nativeList The second group of breadcrumbs from the native layer.
 * @returns An array of unique breadcrumbs merged from both lists.
   */
  private _mergeUniqueBreadcrumbs(jsList: Breadcrumb[], nativeList: Breadcrumb[]): Breadcrumb[] {

    let jsIndex = 0;
    let natIndex = 0;
    const combinedList: Breadcrumb[] = [];
    while (jsIndex < jsList.length && natIndex < nativeList.length)
    {
      const jsBreadcrumb = jsList[jsIndex];
      const natBreadcrumb = nativeList[natIndex];
      if (jsBreadcrumb.timestamp === natBreadcrumb.timestamp &&
        jsBreadcrumb.message === natBreadcrumb.message) {
        combinedList.push(jsBreadcrumb);
        jsIndex++;
        natIndex++;
      }
      else if (jsBreadcrumb.timestamp && natBreadcrumb.timestamp &&
        jsBreadcrumb.timestamp < natBreadcrumb.timestamp)
      {
        combinedList.push(jsBreadcrumb);
        jsIndex++;
      }
      else {
        combinedList.push(natBreadcrumb);
        natIndex++;
      }
    }

    while (jsIndex < jsList.length) {
      combinedList.push(jsList[jsIndex++]);
    }

    while (natIndex < nativeList.length) {
      combinedList.push(nativeList[natIndex++]);
    }
    return combinedList;
  }
}
