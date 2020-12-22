#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(SentryCapacitor, "SentryCapacitor",
           CAP_PLUGIN_METHOD(startWithOptions, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setLogLevel, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setUser, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(crash, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(fetchRelease, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(captureEnvelope, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getStringBytesLength, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addBreadcrumb, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearBreadcrumbs, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setExtra, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setTag, CAPPluginReturnPromise);
)
