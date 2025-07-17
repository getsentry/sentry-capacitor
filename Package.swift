// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SentryCapacitor",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "SentryCapacitor",
            targets: ["SentryCapacitorPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.53.2")
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
