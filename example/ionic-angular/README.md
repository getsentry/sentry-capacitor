# Instructions for using this test app

## Install dependencies
`npm install`

## Build for native
`ionic build`

## Sync resources
`npx cap sync`

## Open emulator
`npx cap open android`


# General Capacitor/Ionic Instructions

## Add Capacitor to an existing Ionic project
Full details can be found at capacitorjs.com/docs/getting-started/with-ionic
1. `ionic integrations enable capacitor`
2. `npx cap init [appName] [appId]`
3. `ionic build`
4. `npx cap add ios`
5. `npx cap add android`
6. `npx cap sync`

## Add Sentry/Capacitor to your project

Install the package using **npm**:

    npm install --save @sentry/capacitor
    
 OR using **yarn**:
 
    yarn add @sentry/capacitor

### Android setup
Add the plugin class to your app's MainActivity.java

    import io.sentry.capacitor.SentryCapacitor;
    
    public class MainActivity extends BridgeActivity {
         @override
         public void onCreate(Bundle savedInstanceState) {
              super.onCreate(savedInstanceState);
              this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
                   add(SentryCapacitor.class);
              }});
         }
    }

### Usage

In your project's app.module.ts:

    import * as Sentry from "@sentry/capacitor";
    
    Sentry.init({
         dsn: "__DSN__"
    });
    

In any file where you want to capture an event:

    Sentry.setTag("myTag", "tag-value");
    Sentry.setExtra("myExtra", "extra-value");
    Sentry.addBreadcrumb({ message: "test" });
    
    Sentry.captureMessage("Hello Sentry!");
