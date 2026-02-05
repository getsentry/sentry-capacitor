// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SentryCapacitor",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "SentryCapacitor",
            targets: ["SentryCapacitorPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "7.0.0"..<"9.0.0"),
        .package(url: "https://github.com/getsentry/sentry-cocoa", from: "9.3.0")
    ],
    targets: [
        .target(
            name: "SentryCapacitorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "Sentry", package: "sentry-cocoa")
            ],
            path: "ios/Sources/SentryCapacitorPlugin"),
        .testTarget(
            name: "SentryCapacitorPluginTests",
            dependencies: ["SentryCapacitorPlugin"],
            path: "ios/Tests/SentryCapacitorPluginTests")
    ]
)
