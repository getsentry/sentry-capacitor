# Changelog

## Unreleased

### Dependencies

- Bump Sentry JavaScript SDK to `7.15.0` ([#244](https://github.com/getsentry/sentry-capacitor/pull/244))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.15.0)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/7.13.0...7.15.0)
- Bump Sentry iOS SDK to `7.30.2` ([#259](https://github.com/getsentry/sentry-capacitor/pull/259))
  - [changelog](https://github.com/getsentry/sentry-cocoa/releases/tag/7.30.2)
  - [diff](https://github.com/getsentry/sentry-cocoa/compare/7.23.0...7.30.2)
- Bump Sentry Android SDK to `6.4.3` ([#230](https://github.com/getsentry/sentry-capacitor/pull/230))
  - [changelog](https://github.com/getsentry/sentry-java/releases/tag/6.4.3)
  - [diff](https://github.com/getsentry/sentry-java/compare/5.7.0...6.4.3)

## 0.10.1

### Fixes

- Fallback to iOS minimum version 13.0 if Capacitor package was not found ([#225](https://github.com/getsentry/sentry-capacitor/pull/225))

### Dependencies

- Bump Sentry JavaScript SDK to `7.13.0` ([#222](https://github.com/getsentry/sentry-capacitor/pull/222))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.13.0)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/7.12.1...7.13.0)

## 0.10.0

### Features

- Add support for Capacitor 4.0.0 ([#201](https://github.com/getsentry/sentry-capacitor/pull/201))

### Fixes

- build(javascript): Bump sentry-javascript, sentry-vue, sentry-react and sentry-angular dependencies to `7.12.1`. ([#214](https://github.com/getsentry/sentry-capacitor/pull/214s))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.12.1)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/7.8.1...7.12.1)

## 0.9.0

### Fixes

- Bump Sentry Javascript to fix incompatibility with Sentry Tracing ([#202](https://github.com/getsentry/sentry-capacitor/pull/202))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.8.1)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/7.6.0...7.8.1)
- build(ios): Bump sentry-cocoa dependencies to `7.23.0`. ([#208](https://github.com/getsentry/sentry-capacitor/pull/208))
  - [changelog](https://github.com/getsentry/sentry-cocoa/releases/tag/7.23.0)
  - [diff](https://github.com/getsentry/sentry-cocoa/compare/7.11.0...7.23.0)

## 0.8.0

### Features

- Support for Angular Web ([#199](https://github.com/getsentry/sentry-capacitor/pull/199))

## 0.7.1

### Fixes

- build(javascript): Bump sentry-javascript, sentry-vue, sentry-react and sentry-angular dependencies to `7.6.0`. ([#194](https://github.com/getsentry/sentry-capacitor/pull/194))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.6.0)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/7.1.1...7.6.0)

## 0.7.0

### Fixes

- SentryCapacitor.crash not working on Android ([#175](https://github.com/getsentry/sentry-capacitor/pull/175))
- build(javascript): Bump sentry-javascript, sentry-vue, sentry-react and sentry-angular dependencies to `7.1.1`. ([#186](https://github.com/getsentry/sentry-capacitor/pull/186))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/7.1.1)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/6.19.2...7.1.1)

## Breaking changes

By bumping Sentry Javascript, new breaking changes were introduced, to know more what was changed, check the [breaking changes changelog](https://github.com/getsentry/sentry-javascript/blob/7.0.0/CHANGELOG.md#breaking-changes) from Sentry Javascript.

## 0.6.1

### Fixes

- Fix Vue not working on iOS ([#170](https://github.com/getsentry/sentry-capacitor/pull/170))

## 0.6.0

### Features

- Add iOS metadata to JavaScript events ([#161](https://github.com/getsentry/sentry-capacitor/pull/161))

### Fixes

- Stack Trace when using localhost could get the wrong filename ([#162](https://github.com/getsentry/sentry-capacitor/pull/162))
- build(javascript): Bump sentry-javascript, sentry-vue, sentry-react and sentry-angular dependencies to `6.19.2`. ([#159](https://github.com/getsentry/sentry-capacitor/pull/159))
  - [changelog](https://github.com/getsentry/sentry-javascript/releases/tag/6.19.2)
  - [diff](https://github.com/getsentry/sentry-javascript/compare/6.17.4...6.19.2)
- build(ios): Bump sentry-cocoa dependencies to `7.11.0`. ([#157](https://github.com/getsentry/sentry-capacitor/pull/157))
  - [changelog](https://github.com/getsentry/sentry-cocoa/releases/tag/5.11.0)
  - [diff](https://github.com/getsentry/sentry-cocoa/compare/7.1.3...7.11.0)

## 0.5.0

### Fixes

- Fix(Android): duplicated breadcrumbs ([#151](https://github.com/getsentry/sentry-capacitor/pull/151))
- build(android): Bump sentry-java dependencies to `5.7.0`. ([#154](https://github.com/getsentry/sentry-capacitor/pull/154))
  - [changelog](https://github.com/getsentry/sentry-java/releases/tag/5.7.0)
  - [diff](https://github.com/getsentry/sentry-java/compare/5.0.1...5.7.0)
- Fix iOS dropping events if envelope contains UTF16 character or higher ([#150](https://github.com/getsentry/sentry-capacitor/pull/150))
- (iOS) Missing config `enableOutOfMemoryTracking` on iOS/Mac ([#147](https://github.com/getsentry/sentry-capacitor/pull/147))

## 0.4.4

### Fixes

- Disable native sdk when enabled/enablenative is set to false ([#145](https://github.com/getsentry/sentry-capacitor/pull/145))
- Remove sdkProcessingMetadata from native events ([#139](https://github.com/getsentry/sentry-capacitor/pull/139))

## 0.4.3

### Fixes

- Use Native length for Envelopes when available ([#128](https://github.com/getsentry/sentry-capacitor/pull/128))

## 0.4.2

### Fixes

- No longer export deprecated Status enum ([#111](https://github.com/getsentry/sentry-capacitor/pull/111))
- Remove guard from transport sendEvent as it is redundant ([#111](https://github.com/getsentry/sentry-capacitor/pull/111))

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
