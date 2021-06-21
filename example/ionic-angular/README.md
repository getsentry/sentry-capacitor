# Instructions for using the example app

Please use only `npm` for this example, as yarn will ignore the `files` and `.npmignore` when using a local module, causing this
example to be copied into `node_modules` in a circular fashion.

## Install dependencies

`npm install`

## Build for native

`ionic build`

## Sync resources

`npx cap sync`

## Open emulator

`npx cap open android`
