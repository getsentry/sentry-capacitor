# Sentry Capacitor and JavaScript SDK Migration Docs

These docs walk through how to migrate our Capacitor and JavaScript SDKs.
The documentation will guide you to upgrade @Sentry/Capacitor along with the siblings,

# Upgrading from Sentry Capacitor 0.x to 1.x

- With this change, we will no longer support Angular 13, if you need to stay on Angular 13, you should stay on version 0.X and `@Sentry/Angular` on version 7.x.

- If you use the package `@sentry/angular-ivy`, you will need to replace it by `@sentry/angular`.

- enableOutOfMemoryTracking was removed and replaced by enableWatchdogTerminationTracking.


# Upgrading from Sentry packages 7.x to 8.x

The main goal of version 8 is to improve our performance monitoring APIs, integrations API, and ESM support. This
version is breaking because we removed deprecated APIs, restructured npm package contents, and introduced new
dependencies on OpenTelemetry. Below we will outline the steps you need to take to tackle to deprecated methods.

Before updating to `8.x` of the SDK, we recommend upgrading to the latest version of `7.x`. You can then follow
[these steps](./MIGRATION.md#deprecations-in-7x) remove deprecated methods in `7.x` before upgrading to `8.x`.

The v8 version of the JavaScript SDK requires a self-hosted version of Sentry 24.4.2 (for user feedback screenshots) or
higher. Lower versions may continue to work, but may not support all features (e.g. the new user feedback APIs).

## 1. Version Support changes:

**Node.js**: We now officially support Node 14.18+ for our CJS package, and Node 18.19.1+ for our ESM package. This
applies to `@sentry/node` and all of our node-based server-side sdks (`@sentry/nextjs`, `@sentry/serverless`, etc.). We
no longer test against Node 8, 10, or 12 and cannot guarantee that the SDK will work as expected on these versions.

**Browser**: Our browser SDKs (`@sentry/browser`, `@sentry/react`, `@sentry/vue`, etc.) now require ES2018+ compatible
browsers. This means that we no longer support IE11 (end of an era). This also means that the Browser SDK requires the
fetch API to be available in the environment.

New minimum supported browsers:

- Chrome 63
- Edge 79
- Safari/iOS Safari 12
- Firefox 58
- Opera 50
- Samsung Internet 8.2

For IE11 support please transpile your code to ES5 using babel or similar and add required polyfills.

**React**: The Next.js SDK now supports React 16+

**Next.js**: The Next.js SDK now supports Next.js 13.2.0+

**Express**: Complex router setups are only properly parametrized in Node 16+.

## 2. Package removal

We've removed the following packages:

- [@sentry/hub](./MIGRATION.md#sentryhub)
- [@sentry/tracing](./MIGRATION.md#sentrytracing)
- [@sentry/integrations](./MIGRATION.md#sentryintegrations)
- [@sentry/serverless](./MIGRATION.md#sentryserverless)
- [@sentry/replay](./MIGRATION.md#sentryreplay)

#### @sentry/hub

`@sentry/hub` has been removed and will no longer be published. All of the `@sentry/hub` exports have moved to
`@sentry/core`.

#### @sentry/tracing

`@sentry/tracing` has been removed and will no longer be published. See
[below](./MIGRATION.md/#3-removal-of-deprecated-apis) for more details.

For Browser SDKs you can import `browserTracingIntegration` from the SDK directly:

```js
// v7
import * as Sentry from '@sentry/capacitor';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [new Sentry.BrowserTracing()],
});
```

```js
// v8
im
import * as Sentry from '@sentry/capacitor';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [Sentry.browserTracingIntegration()],
});
```

If you don't want to use `browserTracingIntegration` but still manually start spans, you can now use
`Sentry.registerSpanErrorInstrumentation()` to setup handlers for span instrumentation.
`registerSpanErrorInstrumentation` replaces the `addExtensionMethods` method from `@sentry/tracing`.

```js
// v7
import * as Sentry from '@sentry/capacitor';
import '@sentry/tracing';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});
```

```js
// v8
import * as Sentry from '@sentry/capacitor';

Sentry.registerSpanErrorInstrumentation();

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});
```

#### @sentry/integrations

`@sentry/integrations` has been removed and will no longer be published. We moved pluggable integrations from their own
package (`@sentry/integrations`) to `@sentry/browser` and `@sentry/node`. in addition they are now functions instead of
classes.

```js
// v7
import { RewriteFrames } from '@sentry/integrations';
```

```js
// v8
import { rewriteFramesIntegration } from '@sentry/browser';
```

Integrations that are now exported from `@sentry/browser` (or framework-specific packages like `@sentry/react`):

- `httpClientIntegration` (`HTTPClient`)
- `contextLinesIntegration` (`ContextLines`)
- `reportingObserverIntegration` (`ReportingObserver`)

Integrations that are now exported from `@sentry/node` and `@sentry/browser` (or framework-specific packages like
`@sentry/react`):

- `captureConsoleIntegration` (`CaptureConsole`)
- `debugIntegration` (`Debug`)
- `extraErrorDataIntegration` (`ExtraErrorData`)
- `rewriteFramesIntegration` (`RewriteFrames`)
- `sessionTimingIntegration` (`SessionTiming`)
- `dedupeIntegration` (`Dedupe`) - _Note: enabled by default, not pluggable_

The `Transaction` integration has been removed from `@sentry/integrations`. There is no replacement API.

#### @sentry/replay

`@sentry/replay` has been removed and will no longer be published. You can import replay functionality and the replay
integration directly from the Capacitor SDK or browser framework-specific packages like `@sentry/react`.

```js
// v7
import { Replay } from '@sentry/capacitor';
```

```js
import { replayIntegration } from '@sentry/capacitor';
```

## 3. Performance Monitoring Changes

- [Initializing the SDK in v8](./MIGRATION.md/#initializing-the-node-sdk)
- [Performance Monitoring API](./MIGRATION.md#performance-monitoring-api)
- [Performance Monitoring Integrations](./MIGRATION.md#performance-monitoring-integrations)

### Performance Monitoring API

The APIs for Performance Monitoring in the SDK have been revamped to align with OpenTelemetry, an open standard for

tracing and metrics. This allows us to provide a more consistent and powerful API for performance monitoring, and adds
support for a variety of new integrations out of the box for our Node SDK.

Instead of using `startTransaction` and `span.startChild`, you rely on new helper methods to create spans top level
helpers to create spans.

```js
// Measure how long a callback takes, `startSpan` returns the value of the callback.
// The span will become the "active span" for the duration of the callback.
const value = Sentry.startSpan({ name: 'mySpan' }, span => {
  span.setAttribute('key', 'value');
  return expensiveFunction();
});

// `startSpan` works with async callbacks as well - just make sure to return a promise!
const value = await Sentry.startSpan({ name: 'mySpan' }, async span => {
  span.setAttribute('key', 'value');
  return await expensiveFunction();
});

// You can nest spans via more `startSpan` calls.
const value = Sentry.startSpan({ name: 'mySpan' }, span => {
  span.setAttribute('key1', 'value1');

  // `nestedSpan` becomes the child of `mySpan`.
  return Sentry.startSpan({ name: 'nestedSpan' }, nestedSpan => {
    nestedSpan.setAttribute('key2', 'value2');
    return expensiveFunction();
  });
});

// You can also create an inactive span that does not take a callback.
// Useful when you need to pass a span reference into another closure (like measuring duration between hooks).
const span = Sentry.startInactiveSpan({ name: 'mySpan' });

// Use `startSpanManual` if you want to manually control when to end the span
// Useful when you need to hook into event emitters or similar.
function middleware(res, req, next) {
  return Sentry.startSpanManual({ name: 'mySpan' }, span => {
    res.on('finish', () => {
      span.end();
    });
    return next();
  });
}
```

You can [read more about the new performance APIs here](https://github.com/getsentry/sentry-javascript/docs/v8-new-performance-apis.md).

To accommodate these changes, we're removed the following APIs:

- [`startTransaction` and `span.startChild`](./MIGRATION.md#deprecate-starttransaction--spanstartchild)
- [Certain arguments in `startSpan` and `startTransaction`](./MIGRATION.md#deprecate-arguments-for-startspan-apis)
- [`scope.getSpan` and `scope.setSpan`](./MIGRATION.md#deprecate-scopegetspan-and-scopesetspan)
- [Variations of `continueTrace`](./MIGRATION.md#deprecate-variations-of-sentrycontinuetrace)

We've also removed a variety of [top level fields](./MIGRATION.md#deprecated-fields-on-span-and-transaction) on the
`span` class.

### Performance Monitoring Integrations

As we added support for OpenTelemetry, we have expanded the automatic instrumentation for our Node.js SDK. We are adding
support for frameworks like Fastify, Nest.js, and Hapi, and expanding support for databases like Prisma and MongoDB via
Mongoose.

We now support the following integrations out of the box without extra configuration:

- `httpIntegration`: Automatically instruments Node `http` and `https` standard libraries
- `nativeNodeFetchIntegration`: Automatically instruments top level fetch and undici
- `expressIntegration`: Automatically instruments Express.js
- `fastifyIntegration`: Automatically instruments Fastify
- `hapiIntegration`: Automatically instruments Hapi
- `graphqlIntegration`: Automatically instruments GraphQL
- `mongoIntegration`: Automatically instruments MongoDB
- `mongooseIntegration`: Automatically instruments Mongoose
- `mysqlIntegration`: Automatically instruments MySQL
- `mysql2Integration`: Automatically instruments MySQL2
- `redisIntegration`: Automatically instruments Redis (supported clients: ioredis)
- `nestIntegration`: Automatically instruments Nest.js
- `postgresIntegration`: Automatically instruments PostgreSQL
- `prismaIntegration`: Automatically instruments Prisma

To make sure these integrations work properly you'll have to change how you
[initialize the SDK](https://github.com/getsentry/sentry-javascript/docs/v8-initializing.md)

## 4. Removal of deprecated APIs

- [General](./MIGRATION.md#general)
- [Browser SDK](./MIGRATION.md#browser-sdk-browser-react-vue-angular-ember-etc)
- [Server-side SDKs (Node, Deno, Bun)](./MIGRATION.md#server-side-sdks-node-deno-bun-etc)
- [Next.js SDK](./MIGRATION.md#nextjs-sdk)
- [SvelteKit SDK](./MIGRATION.md#sveltekit-sdk)
- [Astro SDK](./MIGRATION.md#astro-sdk)
- [AWS Serverless SDK](./MIGRATION.md#aws-serverless-sdk)
- [Ember SDK](./MIGRATION.md#ember-sdk)
- [Svelte SDK](./MIGRATION.md#svelte-sdk)
- [React SDK](./MIGRATION.md#react-sdk)

### General

Removed top-level exports: `tracingOrigins`, `MetricsAggregator`, `metricsAggregatorIntegration`, `Severity`,
`Sentry.configureScope`, `Span`, `spanStatusfromHttpCode`, `makeMain`, `pushScope`, `popScope`,
`addGlobalEventProcessor`, `timestampWithMs`, `addExtensionMethods`, `addGlobalEventProcessor`, `getActiveTransaction`

Removed `@sentry/utils` exports: `timestampWithMs`, `addOrUpdateIntegration`, `tracingContextFromHeaders`, `walk`

- [Deprecation of `Hub` and `getCurrentHub()`](./MIGRATION.md#deprecate-hub)
- [Removal of class-based integrations](./MIGRATION.md#removal-of-class-based-integrations)
- [`tracingOrigins` option replaced with `tracePropagationTargets`](./MIGRATION.md#tracingorigins-has-been-replaced-by-tracepropagationtargets)
- [Removal of `MetricsAggregator` and `metricsAggregatorIntegration`](./MIGRATION.md#removal-of-the-metricsaggregator-integration-class-and-metricsaggregatorintegration)
- [Removal of `Severity` Enum](./MIGRATION.md#removal-of-severity-enum)
- [Removal of `Sentry.configureScope` method](./MIGRATION.md#removal-of-sentryconfigurescope-method)
- [Removal of `Span` class export from SDK packages](./MIGRATION.md#removal-of-span-class-export-from-sdk-packages)
- [Removal of `spanStatusfromHttpCode` in favour of `getSpanStatusFromHttpCode`](./MIGRATION.md#removal-of-spanstatusfromhttpcode-in-favour-of-getspanstatusfromhttpcode)
- [Removal of `addGlobalEventProcessor` in favour of `addEventProcessor`](./MIGRATION.md#removal-of-addglobaleventprocessor-in-favour-of-addeventprocessor)
- [Remove `void` from transport return types](./MIGRATION.md#remove-void-from-transport-return-types)
- [Remove `addGlobalEventProcessor` in favor of `addEventProcessor`](./MIGRATION.md#remove-addglobaleventprocessor-in-favor-of-addeventprocessor)

#### Deprecation of `Hub` and `getCurrentHub()`

The `Hub` has been a very important part of the Sentry SDK API up until now. Hubs were the SDK's "unit of concurrency"
to keep track of data across threads and to scope data to certain parts of your code. Because it is overly complicated
and confusing to power users, it is going to be replaced by a set of new APIs: the "new Scope API". For now `Hub` and
`getCurrentHub` are still available, but it will be removed in the next major version.

See [Deprecate Hub](./MIGRATION.md#deprecate-hub) for details on how to replace existing usage of the Hub APIs.

The `hub.bindClient` and `makeMain` methods have been removed entirely, see
[initializing the SDK in v8](https://github.com/getsentry/sentry-javascript/docs/v8-initializing.md) for details how to work around this.

#### Removal of class-based integrations

In v7, integrations are classes and can be added as e.g. `integrations: [new Sentry.Replay()]`. In v8, integrations will
not be classes anymore, but instead functions. Both the use as a class, as well as accessing integrations from the
`Integrations.XXX` hash, is deprecated in favor of using the new functional integrations. For example,
`new Integrations.LinkedErrors()` becomes `linkedErrorsIntegration()`.

For docs on the new integration interface, see [below](./MIGRATION.md#changed-integration-interface).

For a list of integrations and their replacements, see
[below](./MIGRATION.md#list-of-integrations-and-their-replacements).

The `getIntegration()` and `getIntegrationById()` have been removed entirely, see
[below](./MIGRATION.md#deprecate-getintegration-and-getintegrationbyid).

```js
// v7
const replay = Sentry.getIntegration(Replay);
```

```js
// v8
const replay = getClient().getIntegrationByName('Replay');
```

#### `framesToPop` applies to parsed frames

Error with `framesToPop` property will have the specified number of frames removed from the top of the stack. This
changes compared to the v7 where the property `framesToPop` was used to remove top n lines from the stack string.

#### `tracingOrigins` has been replaced by `tracePropagationTargets`

`tracingOrigins` is now removed in favor of the `tracePropagationTargets` option. The `tracePropagationTargets` option
should be set in the `Sentry.init()` options, or in your custom `Client`s option if you create them. We've also updated
the behavior of the `tracePropagationTargets` option for Browser SDKs, see
[below](./MIGRATION.md/#updated-behaviour-of-tracepropagationtargets-in-the-browser-http-tracing-headers--cors) for more
details.

For example for the Browser SDKs:

```ts
// v7
Sentry.init({
  dsn: '__DSN__',
  integrations: [new Sentry.BrowserTracing({ tracingOrigins: ['localhost', 'example.com'] })],
});
```

```ts
// v8
Sentry.init({
  dsn: '__DSN__',
  integrations: [Sentry.browserTracingIntegration()],
  tracePropagationTargets: ['localhost', 'example.com'],
});
```

#### Removal of the `MetricsAggregator` integration class and `metricsAggregatorIntegration`

The SDKs now support metrics features without any additional configuration.

```ts
// v7 - Server (Node/Deno/Bun)
Sentry.init({
  dsn: '__DSN__',
  _experiments: {
    metricsAggregator: true,
  },
});

// v7 - Browser
Sentry.init({
  dsn: '__DSN__',
  integrations: [Sentry.metricsAggregatorIntegration()],
});
```

```ts
// v8
Sentry.init({
  dsn: '__DSN__',
});
```

#### Removal of Severity Enum

In v7 we deprecated the `Severity` enum in favor of using the `SeverityLevel` type as this helps save bundle size, and
this has been removed in v8. You should now use the `SeverityLevel` type directly.

```js
// v7
import { Severity, SeverityLevel } from '@sentry/types';

const levelA = Severity.error;

const levelB: SeverityLevel = "error"
```

```js
// v8
import { SeverityLevel } from '@sentry/types';

const levelA = "error" as SeverityLevel;

const levelB: SeverityLevel = "error"
```

#### Removal of `Sentry.configureScope` method

The top level `Sentry.configureScope` function has been removed. Instead, you should use the `Sentry.getCurrentScope()`
to access and mutate the current scope.

```js
// v7
Sentry.configureScope(scope => {
  scope.setTag('key', 'value');
});
```

```js
// v8
Sentry.getCurrentScope().setTag('key', 'value');
```

#### Removal of `Span` class export from SDK packages

In v8, we are no longer exporting the `Span` class from SDK packages (e.g. `@sentry/browser` or `@sentry/node`).
Internally, this class is now called `SentrySpan`, and it is no longer meant to be used by users directly.

#### Removal of `spanStatusfromHttpCode` in favour of `getSpanStatusFromHttpCode`

In v8, we are removing the `spanStatusfromHttpCode` function in favor of `getSpanStatusFromHttpCode`.

```js
// v7
const spanStatus = spanStatusfromHttpCode(200);
```

```js
// v8
const spanStatus = getSpanStatusFromHttpCode(200);
```

#### Removal of `addGlobalEventProcessor` in favour of `addEventProcessor`

In v8, we are removing the `addGlobalEventProcessor` function in favor of `addEventProcessor`.

```js
// v7
addGlobalEventProcessor(event => {
  delete event.extra;
  return event;
});
```

```js
// v8
Sentry.getGlobalScope().addEventProcessor(event => {
  delete event.extra;
  return event;
});
```

#### Removal of `void` from transport return types

The `send` method on the `Transport` interface now always requires a `TransportMakeRequestResponse` to be returned in
the promise. This means that the `void` return type is no longer allowed.

```ts
// v7
interface Transport {
  send(event: Event): Promise<void | TransportMakeRequestResponse>;
}
```

```ts
// v8
interface Transport {
  send(event: Event): Promise<TransportMakeRequestResponse>;
}
```

#### Removal of `addGlobalEventProcessor` in favor of `addEventProcessor`

In v8, we are removing the `addGlobalEventProcessor` function in favor of `addEventProcessor`.

```js
// v7
addGlobalEventProcessor(event => {
  delete event.extra;
  return event;
});
```

```js
// v8
addEventProcessor(event => {
  delete event.extra;
  return event;
});
```

#### Removal of `Sentry.Handlers.trpcMiddleware()` in favor of `Sentry.trpcMiddleware()`

The Sentry tRPC middleware got moved from `Sentry.Handlers.trpcMiddleware()` to `Sentry.trpcMiddleware()`. Functionally
they are the same:

#### Removal of `Sentry.Handlers.requestHandler()`, `Sentry.Handlers.tracingHandler()` and `Sentry.Handlers.errorHandler()`

For Express and Connect you previously had to use `Sentry.Handlers.requestHandler()`,
`Sentry.Handlers.tracingHandler()`, and `Sentry.Handlers.errorHandler()` to add Sentry instrumentation to your app. In
8.x, you only need to use the framework specific error handler (e.g `Sentry.setupExpressErrorHandler(app)`), you can
remove all other handlers.

```js
// v7
import * as Sentry from '@sentry/node';
Sentry.Handlers.trpcMiddleware();
```

```js
// v8
import * as Sentry from '@sentry/node';
Sentry.trpcMiddleware();
```

### Browser SDK (Browser, React, Vue, Angular, Ember, etc.)

Removed top-level exports: `Offline`, `makeXHRTransport`, `BrowserTracing`, `wrap`

- [Removal of the `BrowserTracing` integration](./MIGRATION.md#removal-of-the-browsertracing-integration)
- [Removal of Offline integration](./MIGRATION.md#removal-of-the-offline-integration)
- [Removal of `makeXHRTransport` transport](./MIGRATION.md#removal-of-makexhrtransport-transport)
- [Removal of `wrap` method](./MIGRATION.md#removal-of-wrap-method)
- [Removal of `@sentry/angular-ivy` package](./MIGRATION.md#removal-of-sentryangular-ivy-package)
- [Removal of `@sentry/replay` package](./MIGRATION.md#removal-of-sentryreplay-package)

#### Removal of the `BrowserTracing` integration

The `BrowserTracing` integration, together with the custom routing instrumentations passed to it, are deprecated in v8.
Instead, you should use `Sentry.browserTracingIntegration()`. See examples
[below](./MIGRATION.md#deprecated-browsertracing-integration)

#### Removal of `interactionsSampleRate` in `browserTracingIntegration` options

The `interactionsSampleRate` option that could be passed to `browserTracingIntegration` or `new BrowserTracing()` was
removed in v8, due to the option being redundant and in favour of bundle size minimization.

It's important to note that this sample rate only ever was applied when collecting INP (Interaction To Next Paint)
values. You most likely don't need to replace this option. Furthermore, INP values are already sampled by the
[`tracesSampleRate` SDK option](https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sampler), like
any regular span. At the time of writing, INP value collection does not deplete your span or transaction quota.

If you used `interactionsSampleRate` before, and still want to reduce INP value collection, we recommend using the
`tracesSampler` SDK option instead:

```javascript
// v7
Sentry.init({
  integrations: [new BrowserTracing({ interactionsSampleRate: 0.1 })],
});
```

```javascript
// v8 - please read the text above, you most likely don't need this :)
Sentry.init({
  tracesSampler: (ctx) => {
    if (ctx.attributes?['sentry.op']?.startsWith('ui.interaction')) {
      return 0.1;
    }
    return 0.5;
  }
})
```

#### Removal of the `Offline` integration

The `Offline` integration has been removed in favor of the
[offline transport wrapper](http://docs.sentry.io/platforms/javascript/configuration/transports/#offline-caching).

#### Removal of `makeXHRTransport` transport

The `makeXHRTransport` transport has been removed. Only `makeFetchTransport` is available now. This means that the
Sentry SDK requires the fetch API to be available in the environment.

#### Removal of `wrap` method

The `wrap` method has been removed. There is no replacement API.

#### Removal of `@sentry/angular-ivy` package

The `@sentry/angular-ivy` package has been removed. The `@sentry/angular` package now supports Ivy by default and
requires at least Angular 14. If you are using Angular 13 or lower, we suggest upgrading your Angular version before
migrating to v8. If you can't upgrade your Angular version to at least Angular 14, you can also continue using the
`@sentry/angular-ivy@7` SDK. However, v7 of the SDKs will no longer be fully supported going forward.

#### Removal of `@sentry/replay` package

You can import from `@sentry/browser` (or from a respective SDK package like `@sentry/react` or `@sentry/vue`).

### React SDK

#### Updated error types to be `unknown` instead of `Error`.

In v8, we are changing the `ErrorBoundary` error types returned from `onError`, `onReset`, `onUnmount`, and
`beforeCapture`. to be `unknown` instead of `Error`. This more accurately matches behaviour of `componentDidCatch`, the
lifecycle method the Sentry `ErrorBoundary` component uses.

As per the [React docs on error boundaries](https://react.dev/reference/react/Component#componentdidcatch):

> error: The `error` that was thrown. In practice, it will usually be an instance of `Error` but this is not guaranteed
> because JavaScript allows to throw any value, including strings or even `null`.

This means you will have to use `instanceof Error` or similar to explicitly make sure that the error thrown was an
instance of `Error`.

The Sentry SDK maintainers also went ahead and made a PR to update the
[TypeScript definitions of `componentDidCatch`](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69434) for the
React package - this will be released with React 20.

## 5. Behaviour Changes

- [Updated behaviour of `tracePropagationTargets` in the browser](./MIGRATION.md#updated-behaviour-of-tracepropagationtargets-in-the-browser-http-tracing-headers--cors)
- [Updated behaviour of `extraErrorDataIntegration`](./MIGRATION.md#extraerrordataintegration-changes)
- [Updated behaviour of `transactionContext` passed to `tracesSampler`](./MIGRATION.md#transactioncontext-no-longer-passed-to-tracessampler)
- [Updated behaviour of `getClient()`](./MIGRATION.md#getclient-always-returns-a-client)
- [Updated behaviour of the SDK in combination with `onUncaughtException` handlers in Node.js](./MIGRATION.md#behaviour-in-combination-with-onuncaughtexception-handlers-in-node.js)
- [Updated expected return value for `captureException()`, `captureMessage()` and `captureEvent` methods on Clients](./MIGRATION.md#updated-expected-return-value-for-captureexception-capturemessage-and-captureevent-methods-on-clients)
- [Removal of Client-Side health check transaction filters](./MIGRATION.md#removal-of-client-side-health-check-transaction-filters)
- [Change of Replay default options (`unblock` and `unmask`)](./MIGRATION.md#change-of-replay-default-options-unblock-and-unmask)
- [Angular Tracing Decorator renaming](./MIGRATION.md#angular-tracing-decorator-renaming)

#### Updated behaviour of `tracePropagationTargets` in the browser (HTTP tracing headers & CORS)

We updated the behaviour of the SDKs when no `tracePropagationTargets` option was defined. As a reminder, you can
provide a list of strings or RegExes that will be matched against URLs to tell the SDK, to which outgoing requests
tracing HTTP headers should be attached to. These tracing headers are used for distributed tracing.

Previously, on the browser, when `tracePropagationTargets` were not defined, they defaulted to the following:
`['localhost', /^\/(?!\/)/]`. This meant that all request targets to that had "localhost" in the URL, or started with a
`/` were equipped with tracing headers. This default was chosen to prevent CORS errors in your browser applications.
However, this default had a few flaws.

Going forward, when the `tracePropagationTargets` option is not set, tracing headers will be attached to all outgoing
requests on the same origin. For example, if you're on `https://example.com/` and you send a request to
`https://example.com/api`, the request will be traced (ie. will have trace headers attached). Requests to
`https://api.example.com/` will not, because it is on a different origin. The same goes for all applications running on
`localhost`.

When you provide a `tracePropagationTargets` option, all of the entries you defined will now be matched be matched
against the full URL of the outgoing request. Previously, it was only matched against what you called request APIs with.
For example, if you made a request like `fetch("/api/posts")`, the provided `tracePropagationTargets` were only compared
against `"/api/posts"`. Going forward they will be matched against the entire URL, for example, if you were on the page
`https://example.com/` and you made the same request, it would be matched against `"https://example.com/api/posts"`.

But that is not all. Because it would be annoying having to create matchers for the entire URL, if the request is a
same-origin request, we also match the `tracePropagationTargets` against the resolved `pathname` of the request.
Meaning, a matcher like `/^\/api/` would match a request call like `fetch('/api/posts')`, or
`fetch('https://same-origin.com/api/posts')` but not `fetch('https://different-origin.com/api/posts')`.

#### `extraErrorDataIntegration` changes

The `extraErrorDataIntegration` integration now looks at
[`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) by
default.

#### `transactionContext` no longer passed to `tracesSampler`

Instead of an `transactionContext` being passed to the `tracesSampler` callback, the callback will directly receive
`name` and `attributes` going forward. Note that the `attributes` are only the attributes at span creation time, and
some attributes may only be set later during the span lifecycle (and thus not be available during sampling).

#### `getClient()` always returns a client

`getClient()` now always returns a client if `Sentry.init()` was called. For cases where this may be used to check if
Sentry was actually initialized, using `getClient()` will thus not work anymore. Instead, you should use the new
`Sentry.isInitialized()` utility to check this.

#### Behaviour in combination with `onUncaughtException` handlers in Node.js

Previously the SDK exited the process by default, even though additional `onUncaughtException` may have been registered,
that would have prevented the process from exiting. You could opt out of this behaviour by setting the
`exitEvenIfOtherHandlersAreRegistered: false` in the `onUncaughtExceptionIntegration` options. Up until now the value
for this option defaulted to `true`.

Going forward, the default value for `exitEvenIfOtherHandlersAreRegistered` will be `false`, meaning that the SDK will
not exit your process when you have registered other `onUncaughtException` handlers.

#### Updated expected return value for `captureException()`, `captureMessage()` and `captureEvent` methods on Clients

The `Client` interface now expects implementations to always return a string representing the generated event ID for the
`captureException()`, `captureMessage()`, `captureEvent()` methods. Previously `undefined` was a valid return value.

#### Removal of Client-Side health check transaction filters

The SDK no longer filters out health check transactions by default. Instead, they are sent to Sentry but still dropped
by the Sentry backend by default. You can disable dropping them in your Sentry project settings. If you still want to
drop specific transactions within the SDK you can either use the `ignoreTransactions` SDK option.

#### Change of Replay default options (`unblock` and `unmask`)

The Replay options `unblock` and `unmask` now have `[]` as default value. This means that if you want to use these
options, you have to explicitly set them like this:

```js
Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      unblock: ['.sentry-unblock, [data-sentry-unblock]'],
      unmask: ['.sentry-unmask, [data-sentry-unmask]'],
    }),
  ],
});
```

#### Angular Tracing Decorator renaming

The usage of `TraceClassDecorator` and the `TraceMethodDecorator` already implies that those are decorators. The word
`Decorator` is now removed from the names to avoid multiple mentioning.

Additionally, the `TraceClass` and `TraceMethod` decorators accept an optional `name` parameter to set the transaction
name. This was added because Angular minifies class and method names, and you might want to set a more descriptive name.
If nothing provided, the name defaults to `'unnamed'`.

```js
// v7
@Sentry.TraceClassDecorator()
export class HeaderComponent {
  @Sentry.TraceMethodDecorator()
  ngOnChanges(changes: SimpleChanges) {}
}
```

```js
// v8
@Sentry.TraceClass({ name: 'HeaderComponent' })
export class HeaderComponent {
  @Sentry.TraceMethod({ name: 'ngOnChanges' })
  ngOnChanges(changes: SimpleChanges) {}
}
```

## 6. Build Changes

We now provide a proper ESM output of the SDK. There have also been some other build changes under the hood. One side
effect of this is that importing Sentry as a default import does not work anymore. Note that this was never supported
(even on v7) and this was never intended to work (and also not documented anywhere). However, it seems that for some
configuration combinations, it was still possible to do `import Sentry from '@sentry/browser'`. This is not possible
anymore in v8. Please use `import * as Sentry from '@sentry/browser'` instead.

# Upgrading Sentry Feedback (beta, 7.x to 8.0)

For details on upgrading Feedback from the beta 7.x to the release 8.x version, please view the
[dedicated Feedback MIGRATION docs](https://github.com/getsentry/sentry-javascript/docs/migration/feedback.md).

---

# Deprecations in 7.x

You can use the **Experimental** [@sentry/migr8](https://www.npmjs.com/package/@sentry/migr8) to automatically update
your SDK usage and fix most deprecations. This requires Node 18+.

```bash
npx @sentry/migr8@latest
```

This will let you select which updates to run, and automatically update your code. Make sure to still review all code
changes!

## Deprecated `BrowserTracing` integration

The `BrowserTracing` integration, together with the custom routing instrumentations passed to it, are deprecated in v8.
Instead, you should use `Sentry.browserTracingIntegration()`.

Package-specific browser tracing integrations are available directly. In most cases, there is a single integration
provided for each package, which will make sure to set up performance tracing correctly for the given SDK. For react, we
provide multiple integrations to cover different router integrations:

### `@sentry/browser`

```js
import * as Sentry from '@sentry/capacitor';
import * as SentryAngular from '@sentry/capacitor';

Sentry.init({
  integrations: [Sentry.browserTracingIntegration()],
},
SentryAngular.init);
```

### `@sentry/react`

```js
import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/React';

Sentry.init({
  integrations: [
    // No react router
    Sentry.browserTracingIntegration(),
    // OR, if you are using react router, instead use one of the following:
    SentryReact.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
      stripBasename,
    }),
    SentryReact.reactRouterV5BrowserTracingIntegration({
      history,
    }),
    SentryReact.reactRouterV4BrowserTracingIntegration({
      history,
    }),
    SentryReact.reactRouterV3BrowserTracingIntegration({
      history,
      routes,
      match,
    }),
  ],
},
SentryReact.init);
```

### `@sentry/vue`

```js
import * as Sentry from '@sentry/capacitor';
import * as SentryVue from '@sentry/vue';

Sentry.init({
  integrations: [
    Sentry.browserTracingIntegration({
      // pass router in, if applicable
      router,
    }),
  ],
},
SentryVue.init);
```

### `@sentry/angular` & `@sentry/angular-ivy`

```js
import * as Sentry from '@sentry/capacitor';
import * as SentryAngular from '@sentry/angular';

Sentry.init({
  integrations: [Sentry.browserTracingIntegration()],
},
SentryAngular.init);

// You still need to add the TraceService like before!
```

## Deprecated `transactionContext` passed to `tracesSampler`

Instead of an `transactionContext` being passed to the `tracesSampler` callback, the callback will directly receive
`name` and `attributes` going forward. You can use these to make your sampling decisions, while `transactionContext`
will be removed in v8. Note that the `attributes` are only the attributes at span creation time, and some attributes may
only be set later during the span lifecycle (and thus not be available during sampling).

## Deprecate using `getClient()` to check if the SDK was initialized

In v8, `getClient()` will stop returning `undefined` if `Sentry.init()` was not called. For cases where this may be used
to check if Sentry was actually initialized, using `getClient()` will thus not work anymore. Instead, you should use the
new `Sentry.isInitialized()` utility to check this.

## Deprecate `getCurrentHub()`

In v8, you will no longer have a Hub, only Scopes as a concept. This also means that `getCurrentHub()` will eventually
be removed.

Instead of `getCurrentHub()`, use the respective replacement API directly - see [Deprecate Hub](#deprecate-hub) for
details.

## Deprecate class-based integrations

In v7, integrations are classes and can be added as e.g. `integrations: [new Sentry.Integrations.ContextLines()]`. In
v8, integrations will not be classes anymore, but instead functions. Both the use as a class, as well as accessing
integrations from the `Integrations.XXX` hash, is deprecated in favor of using the new functional integrations

- for example, `new Integrations.LinkedErrors()` becomes `linkedErrorsIntegration()`.

The following list shows how integrations should be migrated:

### List of integrations and their replacements

| Old                                 | New                                 | Packages                                                                                                |
| ----------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `new BrowserTracing()`              | `browserTracingIntegration()`       | `@sentry/browser`                                                                                       |
| `new InboundFilters()`              | `inboundFiltersIntegration()`       | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new FunctionToString()`            | `functionToStringIntegration()`     | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new LinkedErrors()`                | `linkedErrorsIntegration()`         | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new ModuleMetadata()`              | `moduleMetadataIntegration()`       | `@sentry/core`, `@sentry/browser`                                                                       |
| `new RequestData()`                 | `requestDataIntegration()`          | `@sentry/core`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge`                    |
| `new Wasm() `                       | `wasmIntegration()`                 | `@sentry/wasm`                                                                                          |
| `new Replay()`                      | `replayIntegration()`               | `@sentry/browser`                                                                                       |
| `new ReplayCanvas()`                | `replayCanvasIntegration()`         | `@sentry/browser`                                                                                       |
| `new Feedback()`                    | `feedbackIntegration()`             | `@sentry/browser`                                                                                       |
| `new CaptureConsole()`              | `captureConsoleIntegration()`       | `@sentry/integrations`                                                                                  |
| `new Debug()`                       | `debugIntegration()`                | `@sentry/integrations`                                                                                  |
| `new Dedupe()`                      | `dedupeIntegration()`               | `@sentry/browser`, `@sentry/integrations`, `@sentry/deno`                                               |
| `new ExtraErrorData()`              | `extraErrorDataIntegration()`       | `@sentry/integrations`                                                                                  |
| `new ReportingObserver()`           | `reportingObserverIntegration()`    | `@sentry/integrations`                                                                                  |
| `new RewriteFrames()`               | `rewriteFramesIntegration()`        | `@sentry/integrations`                                                                                  |
| `new SessionTiming()`               | `sessionTimingIntegration()`        | `@sentry/integrations`                                                                                  |
| `new HttpClient()`                  | `httpClientIntegration()`           | `@sentry/integrations`                                                                                  |
| `new ContextLines()`                | `contextLinesIntegration()`         | `@sentry/integrations`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`                                   |
| `new Breadcrumbs()`                 | `breadcrumbsIntegration()`          | `@sentry/browser`, `@sentry/deno`                                                                       |
| `new GlobalHandlers()`              | `globalHandlersIntegration()`       | `@sentry/browser` , `@sentry/deno`                                                                      |
| `new HttpContext()`                 | `httpContextIntegration()`          | `@sentry/browser`                                                                                       |
| `new TryCatch()`                    | `browserApiErrorsIntegration()`     | `@sentry/browser`, `@sentry/deno`                                                                       |
| `new VueIntegration()`              | `vueIntegration()`                  | `@sentry/vue`                                                                                           |
| `new DenoContext()`                 | `denoContextIntegration()`          | `@sentry/deno`                                                                                          |
| `new DenoCron()`                    | `denoCronIntegration()`             | `@sentry/deno`                                                                                          |
| `new NormalizePaths()`              | `normalizePathsIntegration()`       | `@sentry/deno`                                                                                          |
| `new Console()`                     | `consoleIntegration()`              | `@sentry/node`                                                                                          |
| `new Context()`                     | `nodeContextIntegration()`          | `@sentry/node`                                                                                          |
| `new Modules()`                     | `modulesIntegration()`              | `@sentry/node`                                                                                          |
| `new OnUncaughtException()`         | `onUncaughtExceptionIntegration()`  | `@sentry/node`                                                                                          |
| `new OnUnhandledRejection()`        | `onUnhandledRejectionIntegration()` | `@sentry/node`                                                                                          |
| `new LocalVariables()`              | `localVariablesIntegration()`       | `@sentry/node`                                                                                          |
| `new Spotlight()`                   | `spotlightIntegration()`            | `@sentry/node`                                                                                          |
| `new Anr()`                         | `anrIntegration()`                  | `@sentry/node`                                                                                          |
| `new Hapi()`                        | `hapiIntegration()`                 | `@sentry/node`                                                                                          |
| `new Undici()`                      | `nativeNodeFetchIntegration()`      | `@sentry/node`                                                                                          |
| `new Http()`                        | `httpIntegration()`                 | `@sentry/node`                                                                                          |
| `new ProfilingIntegration()`        | `nodeProfilingIntegration()`        | `@sentry/profiling-node`                                                                                |
| `new BrowserProfilingIntegration()` | `browserProfilingIntegration()`     | `@sentry/browser`                                                                                       |

## Deprecate `hub.bindClient()` and `makeMain()`

Instead, either directly use `initAndBind()`, or the new APIs `setCurrentClient()` and `client.init()`. See
[Initializing the SDK in v8](https://github.com/getsentry/sentry-javascript/docs/v8-initializing.md) for more details.

## Deprecate `Transaction` integration

This pluggable integration from `@sentry/integrations` will be removed in v8. It was already undocumented and is not
necessary for the SDK to work as expected.

## Changed integration interface

In v8, integrations passed to a client will have an optional `setupOnce()` hook. Currently, this hook is always present,
but in v8 you will not be able to rely on this always existing anymore - any integration _may_ have a `setup` and/or a
`setupOnce` hook. Additionally, `setupOnce()` will not receive any arguments anymore.

This should not affect most people, but in the case that you are manually calling `integration.setupOnce()` right now,
make sure to guard it's existence properly.

## Deprecate `getIntegration()` and `getIntegrationById()`

This deprecates `getIntegration()` on both the hub & the client, as well as `getIntegrationById()` on the baseclient.
Instead, use `getIntegrationByName()`. You can optionally pass an integration generic to make it easier to work with
typescript:

```ts
const replay = getClient().getIntegrationByName<Replay>('Replay');
```

## Deprecate `Hub`

The `Hub` has been a very important part of the Sentry SDK API up until now. Hubs were the SDK's "unit of concurrency"
to keep track of data across threads and to scope data to certain parts of your code. Because it is overly complicated
and confusing to power users, it is going to be replaced by a set of new APIs: the "new Scope API".

`Scope`s have existed before in the SDK but we are now expanding on them because we have found them powerful enough to
fully cover the `Hub` API.

If you are using the `Hub` right now, see the following table on how to migrate to the new API:

| Old `Hub` API          | New `Scope` API                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `new Hub()`            | `withScope()`, `withIsolationScope()` or `new Scope()`                               |
| hub.isOlderThan()      | REMOVED - Was used to compare `Hub` instances, which are gonna be removed            |
| hub.bindClient()       | A combination of `scope.setClient()` and `client.init()`                             |
| hub.pushScope()        | `Sentry.withScope()`                                                                 |
| hub.popScope()         | `Sentry.withScope()`                                                                 |
| hub.withScope()        | `Sentry.withScope()`                                                                 |
| getClient()            | `Sentry.getClient()`                                                                 |
| getScope()             | `Sentry.getCurrentScope()` to get the currently active scope                         |
| getIsolationScope()    | `Sentry.getIsolationScope()`                                                         |
| getStack()             | REMOVED - The stack used to hold scopes. Scopes are used directly now                |
| getStackTop()          | REMOVED - The stack used to hold scopes. Scopes are used directly now                |
| captureException()     | `Sentry.captureException()`                                                          |
| captureMessage()       | `Sentry.captureMessage()`                                                            |
| captureEvent()         | `Sentry.captureEvent()`                                                              |
| lastEventId()          | `Sentry.lastEventId()`                                                               |
| addBreadcrumb()        | `Sentry.addBreadcrumb()`                                                             |
| setUser()              | `Sentry.setUser()`                                                                   |
| setTags()              | `Sentry.setTags()`                                                                   |
| setExtras()            | `Sentry.setExtras()`                                                                 |
| setTag()               | `Sentry.setTag()`                                                                    |
| setExtra()             | `Sentry.setExtra()`                                                                  |
| setContext()           | `Sentry.setContext()`                                                                |
| configureScope()       | REMOVED - Scopes are now the unit of concurrency                                     |
| run()                  | `Sentry.withScope()` or `Sentry.withIsolationScope()`                                |
| getIntegration()       | `client.getIntegration()`                                                            |
| startTransaction()     | `Sentry.startSpan()`, `Sentry.startInactiveSpan()` or `Sentry.startSpanManual()`     |
| traceHeaders()         | REMOVED - The closest equivalent is now `spanToTraceHeader(getActiveSpan())`         |
| captureSession()       | `Sentry.captureSession()`                                                            |
| startSession()         | `Sentry.startSession()`                                                              |
| endSession()           | `Sentry.endSession()`                                                                |
| shouldSendDefaultPii() | REMOVED - The closest equivalent is `Sentry.getClient().getOptions().sendDefaultPii` |

The `Hub` constructor is also deprecated and will be removed in the next major version. If you are creating Hubs for
multi-client use like so:

```ts
// OLD
const hub = new Hub();
hub.bindClient(client);
makeMain(hub);
```

instead initialize the client as follows:

```ts
// NEW
Sentry.withIsolationScope(() => {
  Sentry.setCurrentClient(client);
  client.init();
});
```

If you are using the Hub to capture events like so:

```ts
// OLD
const client = new Client();
const hub = new Hub(client);
hub.captureException();
```

instead capture isolated events as follows:

```ts
// NEW
const client = new Client();
const scope = new Scope();
scope.setClient(client);
scope.captureException();
```

## Deprecate `client.setupIntegrations()`

Instead, use the new `client.init()` method. You should probably not use this directly and instead use `Sentry.init()`,
which calls this under the hood. But if you have a special use case that requires that, you can call `client.init()`
instead now.

## Deprecate `scope.getSpan()` and `scope.setSpan()`

Instead, you can get the currently active span via `Sentry.getActiveSpan()`. Setting a span on the scope happens
automatically when you use the new performance APIs `startSpan()` and `startSpanManual()`.

## Deprecate `scope.getTransaction()` and `getActiveTransaction()`

Instead, you should not rely on the active transaction, but just use `startSpan()` APIs, which handle this for you.

## Deprecate arguments for `startSpan()` APIs

In v8, the API to start a new span will be reduced from the currently available options. Going forward, only these
argument will be passable to `startSpan()`, `startSpanManual()` and `startInactiveSpan()`:

- `name`
- `attributes`
- `origin`
- `op`
- `startTime`
- `scope`

## Deprecate `startTransaction()` & `span.startChild()`

In v8, the old performance API `startTransaction()` (and `hub.startTransaction()`), as well as `span.startChild()`, will
be removed. Instead, use the new performance APIs:

- `startSpan()`
- `startSpanManual()`
- `startInactiveSpan()`

You can [read more about the new performance APIs here](https://github.com/getsentry/sentry-javascript/docs/v8-new-performance-apis.md).

## Deprecate variations of `Sentry.continueTrace()`

The version of `Sentry.continueTrace()` which does not take a callback argument will be removed in favor of the version
that does. Additionally, the callback argument will not receive an argument with the next major version.

Use `Sentry.continueTrace()` as follows:

```ts
app.get('/your-route', req => {
  Sentry.withIsolationScope(isolationScope => {
    Sentry.continueTrace(
      {
        sentryTrace: req.headers.get('sentry-trace'),
        baggage: req.headers.get('baggage'),
      },
      () => {
        // All events recorded in this callback will be associated with the incoming trace. For example:
        Sentry.startSpan({ name: '/my-route' }, async () => {
          await doExpensiveWork();
        });
      },
    );
  });
});
```

## Deprecated fields on `Span` and `Transaction`

In v8, the Span class is heavily reworked. The following properties & methods are thus deprecated:

- `span.toContext()`: Access the fields directly instead.
- `span.updateWithContext(newSpanContext)`: Update the fields directly instead.
- `span.setName(newName)`: Use `span.updateName(newName)` instead.
- `span.toTraceparent()`: use `spanToTraceHeader(span)` util instead.
- `span.getTraceContext()`: Use `spanToTraceContext(span)` utility function instead.
- `span.sampled`: Use `span.isRecording()` instead.
- `span.spanId`: Use `span.spanContext().spanId` instead.
- `span.parentSpanId`: Use `spanToJSON(span).parent_span_id` instead.
- `span.traceId`: Use `span.spanContext().traceId` instead.
- `span.name`: Use `spanToJSON(span).description` instead.
- `span.description`: Use `spanToJSON(span).description` instead.
- `span.getDynamicSamplingContext`: Use `spanToBaggageHeader(span)` utility function instead.
- `span.tags`: Set tags on the surrounding scope instead, or use attributes.
- `span.data`: Use `spanToJSON(span).data` instead.
- `span.setTag()`: Use `span.setAttribute()` instead or set tags on the surrounding scope.
- `span.setData()`: Use `span.setAttribute()` instead.
- `span.instrumenter` This field was removed and will be replaced internally.
- `span.transaction`: Use `getRootSpan` utility function instead.
- `span.spanRecorder`: Span recording will be handled internally by the SDK.
- `span.status`: Use `.setStatus` to set or update and `spanToJSON()` to read the span status.
- `span.op`: Use `startSpan` functions to set, `setAttribute()` to update and `spanToJSON` to read the span operation.
- `span.isSuccess`: Use `spanToJSON(span).status === 'ok'` instead.
- `transaction.setMetadata()`: Use attributes instead, or set data on the scope.
- `transaction.metadata`: Use attributes instead, or set data on the scope.
- `transaction.setContext()`: Set context on the surrounding scope instead.
- `transaction.setMeasurement()`: Use `Sentry.setMeasurement()` instead. In v8, setting measurements will be limited to
  the currently active root span.
- `transaction.setName()`: Set the name with `.updateName()` and the source with `.setAttribute()` instead.
- `span.startTimestamp`: use `spanToJSON(span).start_timestamp` instead. You cannot update this anymore in v8.
- `span.endTimestamp`: use `spanToJSON(span).timestamp` instead. You cannot update this anymore in v8. You can pass a
  custom end timestamp to `span.end(endTimestamp)`.

## Deprecate `pushScope` & `popScope` in favor of `withScope`

Instead of manually pushing/popping a scope, you should use `Sentry.withScope(callback: (scope: Scope))` instead.

## Deprecate `configureScope` in favor of using `getCurrentScope()`

Instead of updating the scope in a callback via `configureScope()`, you should access it via `getCurrentScope()` and
configure it directly:

```js
Sentry.getCurrentScope().setTag('xx', 'yy');
```

## Deprecate `addGlobalEventProcessor` in favor of `addEventProcessor`

Instead of using `addGlobalEventProcessor`, you should use `addEventProcessor` which does not add the event processor
globally, but to the current client.

For the vast majority of cases, the behavior of these should be the same. Only in the case where you have multiple
clients will this differ - but you'll likely want to add event processors per-client then anyhow, not globally.

In v8, we will remove the global event processors overall, as that allows us to avoid keeping global state that is not
necessary.

## Deprecate `extractTraceParentData` export from `@sentry/core` & downstream packages

Instead, import this directly from `@sentry/utils`.

Generally, in most cases you should probably use `continueTrace` instead, which abstracts this away from you and handles
scope propagation for you.

## Deprecate `timestampWithMs` export - #7878

The `timestampWithMs` util is deprecated in favor of using `timestampInSeconds`.

## `addTracingExtensions` replaces `addExtensionMethods` (since 7.46.0)

Since the deprecation of `@sentry/tracing`, tracing extensions are now added by calling `addTracingExtensions` which is
exported from all framework SDKs.

```js
// Before
import * as Sentry from '@sentry/capacitor';
import { addExtensionMethods } from '@sentry/tracing';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});

addExtensionMethods();

// After
import * as Sentry from '@sentry/capacitor';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});

Sentry.addTracingExtensions();
```

## Remove requirement for `@sentry/tracing` package (since 7.46.0)

With `7.46.0` you no longer require the `@sentry/tracing` package to use tracing and performance monitoring with the
Sentry JavaScript SDKs. The `@sentry/tracing` package will be removed in a future major release, but can still be used
in the meantime.

#### Browser:

```js
// Before
import * as Sentry from '@sentry/capacitor';
import { BrowserTracing} from '@sentry/tracing';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [new BrowserTracing()],
});

// After
import * as Sentry from '@sentry/capacitor';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [new Sentry.BrowserTracing()],
});
```

## Replay options changed (since 7.35.0) - #6645

Some options for replay have been deprecated in favor of new APIs. See
[Replay Migration docs](https://github.com/getsentry/sentry-javascript/docs/migration/replay.md#upgrading-replay-from-7340-to-7350---6645) for details.

## Deprecated `tracingOrigins` (since 7.19.0) - #6176

The `tracingOrigins` option is deprecated in favor of using `shouldCreateSpanForRequest` and `tracePropagationTargets`.

## Deprecate `componentTrackingPreprocessor` in Svelte SDK (since 7.16.0) - #5936

This release adds the `withSentryConfig` feature to the Svelte SDK. It replaces the now deprecated Svelte
`componentTrackingPreprocessor` which will be removed in the next major release.

## Deprecate `getGlobalObject` in `@sentry/utils` (since 7.16.0) - #5949

This is no longer used.

## Deprecate @sentry/hub (since 7.15.0) - #5823

This release deprecates `@sentry/hub` and all of it's exports. All of the `@sentry/hub` exports have moved to
`@sentry/core`. `@sentry/hub` will be removed in the next major release.
