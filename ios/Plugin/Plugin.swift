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

    public override func load() {
      self.registerObserver()
    }

    private func registerObserver() {
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(applicationDidBecomeActive),
                                               name: UIApplication.didBecomeActiveNotification,
                                               object: nil)
    }

    @objc private func applicationDidBecomeActive() {
        didReceiveDidBecomeActiveNotification = true
        // we only need to do that in the 1st time, so removing it
        NotificationCenter.default.removeObserver(self,
                                                  name: UIApplication.didBecomeActiveNotification,
                                                  object: nil)

    }

    @objc func initNativeSdk(_ call: CAPPluginCall) {
        let _optionsDict = call.getObject("options")

        guard let optionsDict = _optionsDict else {
            return call.reject("options is null")
        }

        do {
            let options = try Options.init(dict: optionsDict)

             // Note: For now, in sentry-cocoa, beforeSend is not called before captureEnvelope
            options.beforeSend = { event in
                self.setEventOriginTag(event: event)

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

            self.sentryOptions = options

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

    @objc func fetchNativeSdkInfo(_ call: CAPPluginCall) {
        guard let options = self.sentryOptions else {
            return call.reject("Called fetchSdkInfo without initializing cocoa SDK.")
        }

        call.resolve([
            "name": options.sdkInfo.name,
            "version": options.sdkInfo.version
        ])
    }

    @objc func crash(_ call: CAPPluginCall) {
        SentrySDK.crash()
    }
}
