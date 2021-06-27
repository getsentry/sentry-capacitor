import Foundation
import Capacitor
import Sentry

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(SentryCapacitor)
public class SentryCapacitor: CAPPlugin {
    
    private var sentryOptions: Options?
    
    // The Cocoa SDK is init. after the notification didBecomeActiveNotification is registered.
    // We need to be able to receive this notification and start a session when the SDK is fully operational.
    private var didReceiveDidBecomeActiveNotification = false

    private var didBecomeActiveNotificationName: NSNotification.Name {
#if os(iOS)
        return UIApplication.didBecomeActiveNotification
#elseif os(macOS)
        return NSApplication.didBecomeActiveNotification
#endif
    }

    @objc func initNativeSdk(_ call: CAPPluginCall) {
        let _arguments = call.getObject("options")
        
        guard let arguments = _arguments else {
            return call.reject("options is null")
        }
        
        do {
            let options = try Options.init(dict: arguments)
            
            options.beforeSend = { event in
                self.setEventOriginTag(event: event)

                if var sdk = event.sdk, self.isValidSdk(sdk: sdk) {
                    if let packages = arguments["packages"] as? [String] {
                        if var sdkPackages = sdk["packages"] as? [String] {
                            sdk["packages"] = sdkPackages.append(contentsOf: packages)
                        } else {
                            sdk["packages"] = packages
                        }
                    }

                    if let integrations = arguments["integrations"] as? [String] {
                        if var sdkIntegrations = sdk["integrations"] as? [String] {
                            sdk["integrations"] = sdkIntegrations.append(contentsOf: integrations)
                        } else {
                            sdk["integrations"] = integrations
                        }
                    }
                    event.sdk = sdk
                }

                return event
            }
            
            SentrySDK.start(options: options)

          // checking enableAutoSessionTracking is actually not necessary, but we'd spare the sent bits.
           if didReceiveDidBecomeActiveNotification && sentryOptions?.enableAutoSessionTracking == true {
                // we send a SentryHybridSdkDidBecomeActive to the Sentry Cocoa SDK, so the SDK will mimics
                // the didBecomeActiveNotification notification and start a session if not yet.
               NotificationCenter.default.post(name: Notification.Name("SentryHybridSdkDidBecomeActive"), object: nil)
               // we reset the flag for the sake of correctness
               didReceiveDidBecomeActiveNotification = false
           }
            
            call.resolve()
        } catch {
            call.reject("Failed to start native SDK")
        }
    }
    
    private func setEventOriginTag(event: Event) {
            guard let sdk = event.sdk else {
                return
            }
            if isValidSdk(sdk: sdk) {

                switch sdk["name"] as? String {
                case "sentry.cocoa":
                    setEventEnvironmentTag(event: event, origin: "ios", environment: "native")
                default:
                    return
                }
            }
        }

    private func setEventEnvironmentTag(event: Event, origin: String, environment: String) {
        event.tags?["event.origin"] = origin
        event.tags?["event.environment"] = environment
    }

    private func isValidSdk(sdk: [String: Any]) -> Bool {
        guard let name = sdk["name"] as? String else {
            return false
        }
        return !name.isEmpty
    }
    
    @objc func captureEnvelope(_ call: CAPPluginCall) {
        guard let data = call.getString("envelope")?.data(using: .utf8) else {
            print("Cannot parse the envelope data")
            call.reject("Envelope is null or empty")
            return
        }
    
        guard let envelope = PrivateSentrySDKOnly.envelope(with: data) else {
            print("Cannot parse the envelope data")
            call.reject("Envelope is null or empty")
            return
        }
        
        PrivateSentrySDKOnly.capture(envelope)

        call.resolve()
    }
    
    @objc func fetchRelease(_ call: CAPPluginCall) {
        let infoDict = Bundle.main.infoDictionary
        
        call.resolve([
            "id": infoDict?["CFBundleIdentifier"] ?? "",
            "version": infoDict?["CFBundleShortVersionString"] ?? "",
            "build": infoDict?["CFBundleVersion"] ?? ""
        ])
    }
    
    @objc func crash(_ call: CAPPluginCall) {
        SentrySDK.crash()
    }
}
