import Foundation
import Capacitor
import Sentry

@objc(SentryCapacitor)
public class SentryCapacitor: CAPPlugin {
    
    @objc public func startWithOptions(capOptions: CAPPluginCall) {
        SentrySDK.start { options in
            options.dsn = capOptions.getString("dsn") ?? ""
            options.debug = capOptions.getBool("debug") ?? false
            options.environment = capOptions.getString("environment") ?? "production"
            options.enableAutoSessionTracking = capOptions.getBool("enableAutoSessionTracking") ?? false
            options.sessionTrackingIntervalMillis = capOptions.options["sessionTrackingIntervalMillis"] as? UInt ?? 5000
            options.attachStacktrace = capOptions.getBool("attachStacktrace") ?? false
            
            options.beforeSend = { event in
                return event;
            }
        }
        
        capOptions.resolve(["value": true]);
    }
    
    @objc public func setLogLevel() {}
    
    @objc private func logLevel() {}
    
    @objc public func setUser() {}
    
    @objc public func crash() {}
    
    @objc public func fetchRelease() {}
    
    @objc public func captureEnvelope() {}
    
    @objc public func getStringBytesLength() {}
    
    @objc public func addBreadcrumb() {}
    
    @objc public func clearBreadcrumbs() {}
    
    @objc public func setExtra() {}
    
    @objc public func setTag() {}
}
