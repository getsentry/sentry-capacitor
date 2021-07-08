#import <Capacitor/Capacitor.h>
#import <Foundation/Foundation.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(SentryCapacitor, "SentryCapacitor",
           CAP_PLUGIN_METHOD(initNativeSdk, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(captureEnvelope, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(fetchNativeRelease, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(fetchNativeSdkInfo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setTag, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setExtra, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setUser, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addBreadcrumb, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearBreadcrumbs, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setContext, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(crash, CAPPluginReturnPromise);)
