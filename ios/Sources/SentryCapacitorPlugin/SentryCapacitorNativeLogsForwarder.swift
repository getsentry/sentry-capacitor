import Foundation
import Capacitor
@_spi(Private) @preconcurrency import Sentry

private let nativeLogEventName = "SentryNativeLog"

/**
 * Singleton class that forwards native Sentry SDK logs to JavaScript via Capacitor events.
 * This allows developers to see native SDK logs in the browser console when debug mode is enabled.
 *
 * Note: iOS log forwarding requires sentry-cocoa to expose `SentrySDKLog.setOutput`.
 * See: https://github.com/getsentry/sentry-cocoa/pull/7444
 */
final class SentryCapacitorNativeLogsForwarder: @unchecked Sendable {
    static let shared = SentryCapacitorNativeLogsForwarder()

    private weak var plugin: CAPPlugin?

    private init() {}

    func configure(plugin: CAPPlugin) {
        self.plugin = plugin

        SentrySDKLog.setOutput { [weak self] message in
            // Always print to console (default behavior)
            NSLog("%@", message)

            guard let self = self else { return }
            self.forwardLogMessage(message)
        }
    }

    func stopForwarding() {
        self.plugin = nil
        SentrySDKLog.setOutput { message in NSLog("%@", message) }
    }

    private func forwardLogMessage(_ message: String) {
        guard let plugin = self.plugin else { return }
        guard message.hasPrefix("[Sentry]") else { return }

        let level = extractLevel(from: message)
        let component = extractComponent(from: message)
        let cleanMessage = extractCleanMessage(from: message)

        let body: [String: Any] = [
            "level": level,
            "component": component,
            "message": cleanMessage,
        ]

        DispatchQueue.main.async { [weak plugin] in
            plugin?.notifyListeners(nativeLogEventName, data: body)
        }
    }

    private func extractLevel(from message: String) -> String {
        let pattern = "\\[(debug|info|warning|error|fatal)\\]"
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
              let match = regex.firstMatch(in: message, range: NSRange(message.startIndex..., in: message)),
              match.numberOfRanges > 1,
              let range = Range(match.range(at: 1), in: message)
        else {
            return "info"
        }
        return String(message[range]).lowercased()
    }

    private func extractComponent(from message: String) -> String {
        let pattern = "\\[([A-Za-z]+):\\d+\\]"
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(in: message, range: NSRange(message.startIndex..., in: message)),
              match.numberOfRanges > 1,
              let range = Range(match.range(at: 1), in: message)
        else {
            return "Sentry"
        }
        return String(message[range])
    }

    private func extractCleanMessage(from message: String) -> String {
        let pattern = "^\\[Sentry\\]\\s*\\[[^\\]]+\\]\\s*\\[[^\\]]+\\]\\s*(?:\\[[^\\]]+\\]\\s*)?"
        guard let regex = try? NSRegularExpression(pattern: pattern) else {
            return message
        }
        let result = regex.stringByReplacingMatches(
            in: message,
            range: NSRange(message.startIndex..., in: message),
            withTemplate: ""
        )
        return result.trimmingCharacters(in: .whitespaces)
    }
}
