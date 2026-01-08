> [!WARNING]
> This Sample code may contain security vulnerabilities, should never be used in production, and exists only for illustrative purposes.

# Instructions for using the example app

## Add the local SDK from yalc

On the Sentry Capacitor root folder
`yalc publish`

Then on the ionic-angular folder
`yalc add @sentry/capacitor`

## Install dependencies

`yarn install`

## Build for native

`ionic build`

## Sync resources

`npx cap sync`

## Running

### Android

`npx cap open android`

### iOS

`npx cap open ios`

### Web

`http-server ./www`
