import Foundation
import Capacitor
import Sentry

// Keep compatibility with CocoaPods.
#if SWIFT_PACKAGE
import Sentry._Hybrid
#endif

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(SentryCapacitorPlugin)
public class SentryCapacitorPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SentryCapacitorPlugin"
    public let jsName = "SentryCapacitor"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initNativeSdk",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "captureEnvelope",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchNativeRelease",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchNativeSdkInfo",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchNativeDeviceContexts",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStringBytesLength",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setTag",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setExtra",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUser",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addBreadcrumb",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearBreadcrumbs",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "closeNativeSdk",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setContext",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "crash", returnType:CAPPluginReturnPromise),
    ]

    private let nativeSdkName = "sentry.cocoa.capacitor";

    private var sentryOptions: Options?

    // The Cocoa SDK is init. after the notification didBecomeActiveNotification is registered.
    // We need to be able to receive this notification and start a session when the SDK is fully operational.
    private var didReceiveDidBecomeActiveNotification = false

    public override func load() {
      registerObserver()
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

            let sdkVersion = PrivateSentrySDKOnly.getSdkVersionString()
            PrivateSentrySDKOnly.setSdkName(nativeSdkName, andVersionString: sdkVersion)

             // Note: For now, in sentry-cocoa, beforeSend is not called before captureEnvelope
            options.beforeSend = { [weak self] event in
                self?.setEventOriginTag(event: event)
                return event
            }

            DispatchQueue.main.async { [] in
                SentrySDK.start(options: options)
            }

            sentryOptions = options

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
        guard let bytes = call.getArray("envelope", NSNumber.self) else {
            print("Cannot parse the envelope data")
            call.reject("Envelope is null or empty")
            return
        }

        let pointer = UnsafeMutablePointer<UInt8>.allocate(capacity: bytes.count)
        for (index, number) in bytes.enumerated() {
           // The numbers are stored as int32/64 but only the initial bits contains the number so this conversion is safe
           pointer[index] = UInt8(number.intValue)
        }

        let data = Data(buffer: UnsafeMutableBufferPointer<UInt8>(start: pointer, count: bytes.count))

        guard let envelope = PrivateSentrySDKOnly.envelope(with: data) else {
            call.reject("SentryCapacitor", "Failed to parse envelope from byte array.", nil)
            return
        }
        pointer.deallocate()

        PrivateSentrySDKOnly.capture(envelope)

        call.resolve()
    }

    @objc func getStringBytesLength(_ call: CAPPluginCall) {
        if let payloadSize = call.getString("string")?.utf8.count {
            call.resolve(["value": payloadSize])
        } else {
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
        call.resolve([
            "name": PrivateSentrySDKOnly.getSdkName(),
            "version": PrivateSentrySDKOnly.getSdkVersionString()
        ])
    }

    @objc func fetchNativeDeviceContexts(_ call: CAPPluginCall) {
    // Based on: https://github.com/getsentry/sentry-react-native/blob/a8d5ac86e3c53c90ef8e190cc082bdac440bd2a7/ios/RNSentry.m#L156-L188
    // Updated with: https://github.com/getsentry/sentry-react-native/blob/241b7c2831f1bb5691c735058d8dc3de61c40fac/ios/RNSentry.mm#L190-L228
    // Temp work around until sorted out this API in sentry-cocoa.
    // TODO: If the callback isnt' executed the promise wouldn't be resolved.
        SentrySDK.configureScope { [weak self] scope in
            var contexts: [String : Any?] = [:]
            let serializedScope = scope.serialize()
            for (key, value) in serializedScope {
                contexts[key] = value
            }
            if contexts["user"] == nil {
                contexts["user"] = ["id" : PrivateSentrySDKOnly.installationID]
            }

            if self?.sentryOptions?.debug == true {
                let data: Data? = try? JSONSerialization.data(withJSONObject: contexts, options: [])
                if let data = data {
                  let debugContext = String(data: data, encoding: .utf8)
                  print("Contexts: \(debugContext ?? "")")
                }
            }

            let extraContext = PrivateSentrySDKOnly.getExtraContext()
            var context = contexts["context"] as? [String: Any] ?? [:]

            if let deviceExtraContext = extraContext["device"] as? [String: Any] {
                var deviceContext = context["device"] as? [String: Any] ?? [:]
                for (key, value) in deviceExtraContext {
                    deviceContext[key] = value
                }
                context["device"] = deviceContext
            }

            if let appExtraContext = extraContext["app"] as? [String: Any] {
                var appContext = context["app"] as? [String: Any] ?? [:]
                for (key, value) in appExtraContext {
                    appContext[key] = value
                }
                context["app"] = appContext
            }

            contexts["context"] = context

            call.resolve(contexts as PluginCallResultData)
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
        guard let key = call.getString("key") else {
            return call.reject("Error deserializing tag")
        }
        guard let value = call.getString("value") else {
            SentrySDK.configureScope { scope in
                scope.removeTag(key: key)
            }
            return call.resolve()

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
        SentrySDK.configureScope { [weak self] scope in
            let breadcrumb = Breadcrumb()

            if let timestamp = call.getDouble("timestamp") {
                breadcrumb.timestamp = Date(timeIntervalSince1970: timestamp)
            }

            if let level = call.getString("level"), let processedLevel = self?.processLevel(level) {
                breadcrumb.level = processedLevel
            }

            if let category = call.getString("category") {
                breadcrumb.category = category
            }

            breadcrumb.type = call.getString("type")
            breadcrumb.message = call.getString("message")
            breadcrumb.data = call.getObject("data")

            scope.addBreadcrumb(breadcrumb)
        }

        call.resolve()
    }

    @objc func clearBreadcrumbs(_ call: CAPPluginCall) {
        SentrySDK.configureScope { scope in
            scope.clearBreadcrumbs()
        }

        call.resolve()
    }

    @objc func closeNativeSdk(_ call: CAPPluginCall ) {
        SentrySDK.close()
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
        guard let sdk = event.sdk, isValidSdk(sdk: sdk), let name = sdk["name"] as? String, name == nativeSdkName  else {
            return
        }
        setEventEnvironmentTag(event: event, environment: "native")
    }

    private func setEventEnvironmentTag(event: Event, environment: String) {
        var newTags = [String: String]()

        if let tags = event.tags, !tags.isEmpty {
            newTags.merge(tags) { (_, new) in new }
        }

        newTags["event.origin"] = "ios"

        if !environment.isEmpty {
            newTags["event.environment"] = environment
        }

        event.tags = newTags
    }

    private func isValidSdk(sdk: [String: Any]) -> Bool {
        guard let name = sdk["name"] as? String else {
            return false
        }
        return !name.isEmpty
    }
}
