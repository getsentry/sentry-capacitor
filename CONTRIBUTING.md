# Contributing

## Requirements

You need:

- [nodejs](https://nodejs.org/en/download/) 18 or higher (with corepack enabled)
- [yarn 1](https://classic.yarnpkg.com/lang/en/docs/install) or higher
- [yalc](https://github.com/wclr/yalc) (can be installed with `yarn global add yalc`)
- http-server
- [ionic](https://ionicframework.com/docs/intro/cli)

## Building

First install dependencies of the SDK (the root of the repository)
This is only needed if dependencies are added/removed.

```sh
yarn
```

Once deps are installed, you can build the project:

```sh
yarn build

# Or in watch mode, for development

yarn watch
```

## Updating Sentry Native packages

### Android

- Go to android/build.gradle and update the version of `io.sentry:sentry-android`.

### iOS

- Basically you'll need to edit SentryCapacitor.podspec and ios/Porfile updating the Sentry dependency and validate it on one of the examples apps on this project.
- Run 'pod install --repo-update' on the ios folder and then 'yarn build' on the root folder.

## Running the example apps

We use `yalc` to serve the local package builds to our example apps. You can run the `bump` scripts such as `bump:v3` to package the SDK and sync the latest version to the example apps.

See the readmes in the specific example app folders for individual instructions:

- [ionic-angular-v2](example/ionic-angular-v2/README.md)
- [ionic-angular-v3](example/ionic-angular/README.md)

### Spotlight

in order to test Spotlight, add the following comment to the .env file of each sample app that you wish to test:
`export SENTRY_SPOTLIGHT_URL = http://IP:8969/stream;` where IP is your private IP.

For running Spotlight, please check the website `https://github.com/getsentry/spotlight/releases` and download the latest `@spotlightjs/sidecar`.

## Testing

```sh
yarn test

# Or the watcher when writing tests:
yarn test:watch
```

## Changelog

We'd love for users to update the SDK everytime and as soon as we make a new release. But in reality most users rarely update the SDK.
To help users see value in updating the SDK, we maintain a changelog file with entries split between two headings:

1. `### Features`
2. `### Fixes`

We add the heading in the first PR that's adding either a feature or fixes in the current release.
After a release, the [changelog file will contain only the last release entries](https://github.com/getsentry/sentry-capacitor/blob/main/CHANGELOG.md).

When you open a PR in such case, you need to add a heading 2 named `## Unreleased`, which is replaced during release with the version number chosen.
Below that, you'll add the heading 3 mentioned above. For example, if you're adding a feature "Attach screenshots when capturing errors on iOS", right after a release, and the pull request number is `123`, you'd add to the changelog:

```
## Unreleased

### Features

* Attach screenshots when capturing errors on iOS ([#123](https://github.com/getsentry/sentry-capacitor/pull/123))
```

There's a GitHub action check to verify if an entry was added. If the entry isn't a user-facing change, you can skip the verification with `#skip-changelog` written to the PR description. The bot writes a comment in the PR with a suggestion entry to the changelog based on the PR title.

## Develop with sentry-cocoa

Here are step on how to test your changes in `sentry-cocoa` with `sentry-capacitor`. We assume you have both repositories cloned in siblings folders.

1. Build `sentry-cocoa`.

```sh
cd sentry-cocoa
make init
make build-xcframework
```

2. Link local `sentry-cocoa` build in `sentry-capacitor`

```sh
cd sentry-capacitor
```

Comment out sentry dependency in `SentryCapacitor.podspec`.

```diff
-   s.dependency 'Sentry', '7.31.0'
+   # s.dependency 'Sentry', '7.31.0'
```

Add local pods to `example/ionic-angular/ios/App/Podfile`.

```diff
target 'sample' do

  # ... capacitor config

+  pod 'Sentry/HybridSDK', :path => '../../../sentry-cocoa'
+  pod 'SentryPrivate', :path => '../../../sentry-cocoa/SentryPrivate.podspec'

  # ... rest of the configuration

end
```

## Develop with sentry-java

Here are step on how to test your changes in `sentry-java` with `sentry-capacitor`. We assume that you have `sentry-java` setup, Android SDK installed, correct JAVA version etc.

1. Build and publish `sentry-java` locally.

```sh
cd sentry-java
make dryRelease
ls ~/.m2/repository/io/sentry/sentry-android # check that `sentry-java` was published
```

2. Add local maven to the sample project.

```sh
cd sentry-capacitor/example
```

Add local maven to `example/sample-project/android/build.gradle`.

```diff
allprojects {
    repositories {
+        mavenLocal()
```

Update `sentry-android` version, to the one locally published, in `android/build.gradle`.

```diff
dependencies {
    implementation project(':capacitor-android')+'
-    implementation 'io.sentry:sentry-android:5.4.0'
+    implementation 'io.sentry:sentry-android:6.7.7-my-local-version'
}
```

## Bumping Capacitor

When bumping the dependency of Capacitor, always have a look on the following link to see any changes required on the SDK in order to support the latest versions of Capacitor: https://capacitorjs.com/docs/updating/plugins/6-0
