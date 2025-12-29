import type { Breadcrumb, Package } from '@sentry/core';
import type { CapacitorOptions } from './options';
interface serializedObject {
    [key: string]: string;
}
export type NativeDeviceContextsResponse = {
    [key: string]: Record<string, unknown>;
};
export interface ISentryCapacitorPlugin {
    addBreadcrumb(breadcrumb: Breadcrumb): void;
    captureEnvelope(payload: {
        envelope: string;
    }): PromiseLike<boolean>;
    clearBreadcrumbs(): void;
    closeNativeSdk(): Promise<void>;
    crash(): void;
    fetchNativeRelease(): Promise<{
        build: string;
        id: string;
        version: string;
    }>;
    fetchNativeSdkInfo(): Promise<Package>;
    fetchNativeDeviceContexts(): PromiseLike<NativeDeviceContextsResponse>;
    getStringBytesLength(payload: {
        string: string;
    }): Promise<{
        value: number;
    }>;
    initNativeSdk(payload: {
        options: CapacitorOptions;
    }): Promise<boolean>;
    setUser(payload: {
        defaultUserKeys: serializedObject | null;
        otherUserKeys: serializedObject | null;
    }): void;
    setTag(payload: {
        key: string;
        value: string;
    }): void;
    setExtra(payload: {
        key: string;
        value: string;
    }): void;
    setContext(payload: {
        key: string;
        value: serializedObject | null;
    }): void;
    pauseAppHangTracking(): void;
    resumeAppHangTracking(): void;
}
export {};
//# sourceMappingURL=definitions.d.ts.map