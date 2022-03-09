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

# Troubleshooting

## Mac M1

### Error on step `Sync resources`

You may face the following error during `npx cap sync`

```
/Library/Ruby/Site/2.6.0/rubygems/core_ext/kernel_require.rb:85:in `require': dlopen(/Library/Ruby/Gems/2.6.0/gems/bigdecimal-3.0.2/lib/bigdecimal.bundle, 0x0009): tried: '/Library/Ruby/Gems/2.6.0/gems/bigdecimal-3.0.2/lib/bigdecimal.bundle' (mach-o file, but is an incompatible architecture (have 'x86_64', need 'arm64e')), '/usr/lib/bigdecimal.bundle' (no such file) - /Library/Ruby/Gems/2.6.0/gems/bigdecimal-3.0.2/lib/bigdecimal.bundle (LoadError)
```

To solve this, make sure that you have the arm64 version of cocoapods installed and not x86/64. If the problem persists, make sure that you have an arm64 version of rust installed and not x86/x64.
