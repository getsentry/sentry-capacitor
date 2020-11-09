import { defaultIntegrations } from '@sentry/browser';
import { initAndBind } from '@sentry/core';

import { CapacitorOptions } from './options';
import { CapacitorClient } from './client';
import { Capacitor, Release } from './integrations';

const DEFAULT_OPTIONS: CapacitorOptions = {
    enableNative: true,
    enableNativeNagger: true
}

/**
 * Inits the SDK
 */

export function init(passedOptions: CapacitorOptions = {
    enableNative: true,
    enableNativeNagger: true
}): void {

    const options = {
        ...DEFAULT_OPTIONS,
        ...passedOptions
    }
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = [...defaultIntegrations, new Capacitor(), new Release()];
    }
    initAndBind(CapacitorClient, options);
 }