# Instructions for using the example app

## Add the local SDK from yalc

On the Sentry Capacitor root folder
`yalc publish`

Then on the ionic-angular-v2 folder
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
