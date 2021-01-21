<p  align="center">
	<a  href="https://sentry.io"  target="_blank"  align="center">
		<img  src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png"  width="280">
	</a>
	<br/>
</p>

## Official Sentry SDK for Capacitor

_Work in progress_ Sentry SDK for [Capacitor](https://capacitorjs.com/).

**Release Stage**
_Android alpha_

#### Resources

[![Documentation](https://img.shields.io/badge/documentation-sentry.io-green.svg)](https://docs.sentry.io/platforms/capacitor/)
[![Forum](https://img.shields.io/badge/forum-sentry-green.svg)](https://forum.sentry.io/c/sdks)
[![Discord](https://img.shields.io/discord/621778831602221064)](https://discord.gg/Ww9hbqr)
[![Stack Overflow](https://img.shields.io/badge/stack%20overflow-sentry-green.svg)](https://stackoverflow.com/questions/tagged/sentry)
[![Twitter Follow](https://img.shields.io/twitter/follow/getsentry?label=getsentry&style=social)](https://twitter.com/intent/follow?screen_name=getsentry)

## Usage

To use this SDK, call `Sentry.init(options)` as early as possible after loading the page. This will initialize the SDK and hook into the environment. _Note that you can turn off almost all side effects using the respective options._

    import * as Sentry from '@sentry/capacitor';

    Sentry.init({
      dsn: '__DSN__',
      // ...
    });

To set context information or send manual events, use the exported functions of `@sentry/capacitor`. _Note that these functions will not perform any action before you have called `Sentry.init()`:_

```javascript
import * as Sentry from '@sentry/capacitor';

// Set user information, as well as tags and further extras
Sentry.configureScope(scope => {
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
