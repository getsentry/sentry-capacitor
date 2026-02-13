import type { CapacitorOptions } from './options';
/**
 * Create a new CapacitorOption without any parameter that could crash the bridge (in short, not being a string, number or boolean).
 * some of the excluded parameters are: Integrations, app, vue, beforeSend, beforeBreadcrumb, integrations, defaultIntegrations, transport, tracesSampler.
 * @param options CapacitorOptions
 */
export declare function FilterNativeOptions(options: CapacitorOptions): CapacitorOptions;
//# sourceMappingURL=nativeOptions.d.ts.map