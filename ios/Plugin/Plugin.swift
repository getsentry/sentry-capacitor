import Foundation
import Capacitor
import Sentry

@objc(SentryCapacitor)
public class SentryCapacitor: CAPPlugin {
    
    @objc public func startWithOptions(capOptions: CAPPluginCall) {
        let options = capOptions;
        
        options.beforeSend = { event in
            if (event.exceptions.firstObject.type != nil && ["Unhandled JS Exception"].location != NSNotFound) {
                NSLog("Unhandled JS Exception");
                return nil;
            }
            
            if (event.sdk && event.sdk["name"] == "sentry.cocoa") {
                var newTags: [String: String] = event.tags;
                newTags["event.origin"] = "ios";
                event.tags = newTags;
            }
            
            return event;
        }
        
        SentrySDK.startWithOptionsObject(capOptions);
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
