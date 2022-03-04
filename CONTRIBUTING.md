# Contributing

## Requirements

You need:

- nodejs 8 or higher
- yarn 1 or higher
- yalc
- http-server
- ionic

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
