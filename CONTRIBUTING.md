# Contributing

## Requirements

You need:

- [nodejs](https://nodejs.org/en/download/) 22 or higher (with corepack enabled)
- [yarn 4](https://yarnpkg.com/getting-started/install) (via corepack; each project pins its version with the `packageManager` field, so `corepack enable` is all you need)
- [yalc](https://github.com/wclr/yalc) (can be installed with `npm install --global yalc`)
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

- Edit `Package.swift` updating the `sentry-cocoa` dependency version and validate it on one of the example apps on this project.
- Run 'yarn build' on the root folder.

## Bumping Sentry JavaScript

- You can use the following script `yarn bump:javascript-version version` to bump Sentry JavaScript to the version you desire, this will bump the root package and also the sample apps.
  For example, if you want to update it to version `10.40.0`, You should run the following script `yarn bump:javascript-version 10.40.0`.

## Running the example apps

We use `yalc` to serve the local package builds to our example apps. You can run the `bump` scripts such as `bump:v3` to package the SDK and sync the latest version to the example apps.

See the readmes in the specific example app folders for individual instructions:

- [ionic-angular-v2](example/ionic-angular-v2/README.md)
- [ionic-angular-v3](example/ionic-angular/README.md)

### Spotlight

In order to test Spotlight, modify the file environment.local.ts or local.ts from the sample apps with the following value:

```typescript
export const localConfig = {
  spotlightSidecarUrl: 'http://IP:8969/stream', // replace IP by your local IP.
};
```

If the file is not present on your sample app, it will be automatically generated on the first build from the sample app.

For running Spotlight, please check the website `https://github.com/getsentry/spotlight/releases` and download the latest `@spotlightjs/sidecar`.

NOTE: When testing spotlight on a device that is not the physical device where spotlight server is running, don't forget to expose the port 8969 for TCP.

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

Point the `sentry-cocoa` dependency in `Package.swift` at your local checkout.

```diff
-   .package(url: "https://github.com/getsentry/sentry-cocoa", from: "9.24.0")
+   .package(path: "../../../sentry-cocoa")
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


## AI Use

You are welcome to use whatever tools you prefer for making a contribution. However, any changes you propose have to be reviewed and tested by you, a human, first, before you submit a pull request with them for the Sentry team to review. If we feel like that did not happen, we will close the PR outright. For example, we will not review visibly AI-generated PRs from an agent instructed to look for and "fix" open issues in the repo. This aligns with our SDK principle: [every line has an owner](https://develop.sentry.dev/sdk/getting-started/principles/#every-line-has-an-owner).
