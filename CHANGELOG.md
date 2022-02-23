# Changelog

## 0.4.3

### Fixes

- Add danger and update changelog ([#135](https://github.com/getsentry/sentry-capacitor/pull/135))
- Use Native length for Envelopes when available ([#128](https://github.com/getsentry/sentry-capacitor/pull/128))

## 0.4.2

### Fixes

- No longer export deprecated Status enum ([#111](https://github.com/getsentry/sentry-capacitor/pull/111))
- Remove guard from transport sendEvent as it is redundant ([#11](https://github.com/getsentry/sentry-capacitor/pull/111))

## 0.4.1

### Fixes

- Build into both commonjs and esm ([#99](https://github.com/getsentry/sentry-capacitor/pull/99))

## 0.4.0

### Features

- Officially support web ([#70](https://github.com/getsentry/sentry-capacitor/pull/70))

### Fixes

- Fix the release and dist not being sent down to Android. ([#73](https://github.com/getsentry/sentry-capacitor/pull/73))
- Release health sessions not being logged on iOS. ([#73](https://github.com/getsentry/sentry-capacitor/pull/73))
- build(js): Bump sentry-javascript dependencies to `6.11.0`. ([#72](https://github.com/getsentry/sentry-capacitor/pull/72))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/6.11.0)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/6.5.0...6.11.0)
- Fix version mismatch issues with sentry-javascript dependencies with optional peerDependencies. ([#72](https://github.com/getsentry/sentry-capacitor/pull/72))
- Export startTransaction ([#71](https://github.com/getsentry/sentry-capacitor/pull/71))

## 0.3.0

### Features

- Add complete iOS support with scope sync ([#57](https://github.com/getsentry/sentry-capacitor/pull/57)), ([#61](https://github.com/getsentry/sentry-capacitor/pull/61))

## 0.2.1

### Fixes

- Update Podfile to target iOS 12 to match Capacitor 3 ([#56](https://github.com/getsentry/sentry-capacitor/pull/56))

## 0.2.0

### Features

- Add support for Capacitor v3 ([#54](https://github.com/getsentry/sentry-capacitor/pull/54))

## 0.1.0

### First release

- Initial Release with Android support only.
