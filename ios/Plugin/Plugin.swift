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

            self.sentryOptions = options

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

    @objc func getStringBytesLength(_ call: CAPPluginCall) {
        let payloadSize = call.getString("string")?.utf8.count
        if (payloadSize != nil) {
            call.resolve(["value": payloadSize!])
        }
        else {
            call.reject("Coud not calculate string length.")
        }
    }

    @objc func fetchNativeRelease(_ call: CAPPluginCall) {
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

    @objc func fetchNativeDeviceContexts(_ call: CAPPluginCall) {
    // Based on: https://github.com/getsentry/sentry-react-native/blob/a8d5ac86e3c53c90ef8e190cc082bdac440bd2a7/ios/RNSentry.m#L156-L188
    // Temp work around until sorted out this API in sentry-cocoa.
    // TODO: If the callback isnt' executed the promise wouldn't be resolved.
        SentrySDK.configureScope { [self] scope in
            var contexts: [String : Any?] = [:]

            let serializedScope = scope.serialize()

            // Scope serializes as 'context' instead of 'contexts' as it does for the event.
            let tempContexts = serializedScope["context"]

            var user: [String : Any?] = [:]
            let tempUser = serializedScope["user"] as? [String : Any?]
            if (tempUser != nil) {
                for (key, value) in tempUser! {
                    user[key] = value;
                }
            } else {
                user["id"] = PrivateSentrySDKOnly.installationID
            }

            contexts["user"] = user
            if (tempContexts != nil) {
                contexts["context"] = tempContexts
            }
            if (self.sentryOptions?.debug == true)
            {
                let data: Data? = try? JSONSerialization.data(withJSONObject: contexts, options: [])
                var debugContext: String?
                if let data = data {
                    debugContext = String(data: data, encoding: .utf8)
                }
                print("Contexts: \(debugContext ?? "")")
            }
            call.resolve(contexts as PluginResultData)
        }
    }

    @objc func setUser(_ call: CAPPluginCall) {
        let defaultUserKeys = call.getObject("defaultUserKeys")
        let otherUserKeys = call.getObject("otherUserKeys")


        SentrySDK.configureScope { scope in
            if (defaultUserKeys == nil && otherUserKeys == nil) {
                scope.setUser(nil)
            } else {
                let user = User()


                if let userId = defaultUserKeys?["id"] as? String {
                    user.userId = userId
                }

                user.email = defaultUserKeys?["email"] as! String?
                user.username = defaultUserKeys?["username"] as! String?
                user.ipAddress = defaultUserKeys?["ip_address"] as! String?

                user.data = otherUserKeys

                scope.setUser(user)
            }
        }


        call.resolve()
    }

    @objc func setTag(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value") else {
            return call.reject("Error deserializing tag")
        }

        SentrySDK.configureScope { scope in
            scope.setTag(value: value, key: key)
        }

        call.resolve()
    }

    @objc func setExtra(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            return call.reject("Error deserializing extra")
        }

        let value = call.getString("value")

        SentrySDK.configureScope { scope in
            scope.setExtra(value: value, key: key)
        }

        call.resolve()
    }

    @objc func setContext(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            return call.reject("Error deserializing context")
        }

        SentrySDK.configureScope { scope in
            scope.setContext(value: call.getObject("value") ?? [:], key: key)
        }
    }

    @objc func addBreadcrumb(_ call: CAPPluginCall) {
        SentrySDK.configureScope { scope in
            let breadcrumb = Breadcrumb()

            if let timestamp = call.getDouble("timestamp") {
                breadcrumb.timestamp = Date(timeIntervalSince1970: timestamp)
            }

            if let level = call.getString("level") {
                breadcrumb.level = self.processLevel(level)
            }

            if let category = call.getString("category") {
                breadcrumb.category = category
            }

            breadcrumb.type = call.getString("type")
            breadcrumb.message = call.getString("message")
            breadcrumb.data = call.getObject("data")

            scope.add(breadcrumb)
        }

        call.resolve()
    }

    @objc func clearBreadcrumbs(_ call: CAPPluginCall) {
        SentrySDK.configureScope { scope in
            scope.clearBreadcrumbs()
        }

        call.resolve()
    }

    @objc func crash(_ call: CAPPluginCall) {
        SentrySDK.crash()
    }

    private func processLevel(_ levelString: String) -> SentryLevel {
        switch levelString {
        case "fatal":
            return SentryLevel.fatal
        case "warning":
            return SentryLevel.warning
        case "debug":
            return SentryLevel.debug
        case "error":
            return SentryLevel.error
        case "info":
            return SentryLevel.info
        default:
            return SentryLevel.info
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
}
