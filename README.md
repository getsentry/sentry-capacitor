<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

_Bad software is everywhere, and we're tired of it. Sentry is on a mission to help developers write better software faster, so we can get back to enjoying technology. If you want to join us [<kbd>**Check out our open positions**</kbd>](https://sentry.io/careers/)_

## Official Sentry SDK for Capacitor
[![build](https://github.com/getsentry/sentry-capacitor/workflows/Build%20&%20Test/badge.svg?branch=main)](https://github.com/getsentry/sentry-capacitor/actions?query=branch%3Amain)
[![Discord Chat](https://img.shields.io/discord/621778831602221064?logo=discord&logoColor=ffffff&color=7389D8)](https://discord.gg/PXa5Apfe7K)

## Installation

```bash
# Angular 14 and newer:
yarn add @sentry/capacitor @sentry/angular --exact

# Vue
yarn add @sentry/capacitor @sentry/vue --exact

# React
yarn add @sentry/capacitor @sentry/react --exact

# Other
yarn add @sentry/capacitor @sentry/browser --exact
```

Older versions of Angular require @sentry/capacitor V0, for more information check the page: https://docs.sentry.io/platforms/javascript/guides/capacitor/#angular-version-compatibility


## Usage

To use this SDK, call `Sentry.init` as early as possible after loading the page. This will initialize the SDK and hook into the environment. _Note that you can turn off almost all side effects using the respective options._

```typescript
// app.module.ts

import * as Sentry from "@sentry/capacitor";
import { init as sentryAngularInit, createErrorHandler }  from "@sentry/angular";

// Init by passing the sibling SDK's init as the second parameter.
Sentry.init({
  dsn: "__DSN__",
}, sentryAngularInit);

// Attach the Sentry ErrorHandler
@NgModule({
  providers: [
    {
      provide: ErrorHandler,
      useValue: createErrorHandler(),
    },
  ],
})
```

To set context information or send manual events, use the exported functions of `@sentry/capacitor`. _Note that these functions will not perform any action before you have called `Sentry.init()`:_

```javascript
import * as Sentry from '@sentry/capacitor';

// Set user information, as well as tags and further extras
  const scope = Sentry.getCurrentScope();
  scope.setExtra('battery', 0.7);
  scope.setTag('user_mode', 'admin');
  scope.setUser({ id: '4711' });
  // scope.clear();
});

// Add a breadcrumb for future events
Sentry.addBreadcrumb({
  message: 'My Breadcrumb',
  // ...
});

// Capture exceptions, messages or manual events
Sentry.captureMessage('Hello, world!');
Sentry.captureException(new Error('Good bye'));
Sentry.captureEvent({
  message: 'Manual',
  stacktrace: [
    // ...
  ],
});
```

#### Resources

* [![Documentation](https://img.shields.io/badge/documentation-sentry.io-green.svg)](https://docs.sentry.io/platforms/javascript/guides/capacitor/)
* [![Discussions](https://img.shields.io/github/discussions/getsentry/sentry-capacitor.svg)](https://github.com/getsentry/sentry-capacitor/discussions)
* [![Discord Chat](https://img.shields.io/discord/621778831602221064?logo=discord&logoColor=ffffff&color=7389D8)](https://discord.gg/PXa5Apfe7K)
* [![Stack Overflow](https://img.shields.io/badge/stack%20overflow-sentry-green.svg)](https://stackoverflow.com/questions/tagged/sentry)
* [![Twitter Follow](https://img.shields.io/twitter/follow/getsentry?label=getsentry&style=social)](https://twitter.com/intent/follow?screen_name=getsentry)
