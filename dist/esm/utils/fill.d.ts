/**
 * The same as `import { fill } from '@sentry/core';` but with explicit types.
 */
export declare function fillTyped<Source extends {
    [key: string]: any;
}, Name extends keyof Source & string>(source: Source, name: Name, replacement: (original: Source[Name]) => Source[Name]): void;
//# sourceMappingURL=fill.d.ts.map