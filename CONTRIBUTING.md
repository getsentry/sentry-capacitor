# Contributing

## Requirements

You need:

- [nodejs](https://nodejs.org/en/download/) 8 or higher
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

### iOS

- Basically you'll need to edit SentryCapacitor.podspec and ios/Porfile updating the Sentry dependency and validate it on one of hte examples apps on this proejct.
- Run 'pod install --repo-update' on the ios folder and then 'yarn build' on the root folder.

## Running the example apps

We use `yalc` to serve the local package builds to our example apps. You can run the `bump` scripts such as `bump:v3` to package the SDK and sync the latest version to the example apps.

See the readmes in the specific example app folders for individual instructions:

- [ionic-angular-v2](example/ionic-angular-v2/README.md)
- [ionic-angular-v3](example/ionic-angular/README.md)

## Testing

```sh
yarn test

# Or the watcher when writing tests:
yarn test:watch
```
