#!/usr/bin/env bash
set -euo pipefail

podFile="$(dirname "$0")/../SentryCapacitor.podspec"
swiftFile="$(dirname "$0")/../Package.swift"

case $1 in
get-version)
    if [[ -f "$podFile" ]]; then
        podContent=$(cat $podFile)
        podRegex="('Sentry/HybridSDK', *)'([0-9\.]+)'"
        if [[ $podContent =~ $podRegex ]]; then
            echo ${BASH_REMATCH[2]}
            exit 0
        fi
    fi
    echo "Failed to find sentry-cocoa version in either $podFile"
    exit 1
    ;;
get-repo)
    echo "https://github.com/getsentry/sentry-cocoa.git"
    ;;
set-version)
    # Update podspec file
    if [[ -f "$podFile" ]]; then
        podContent=$(cat $podFile)
        podRegex="('Sentry/HybridSDK', *)'([0-9\.]+)'"
        if [[ $podContent =~ $podRegex ]]; then
            newValue="${BASH_REMATCH[1]}'$2'"
            echo "${podContent/${BASH_REMATCH[0]}/$newValue}" >$podFile
            echo "Updated $podFile with version $2"
        fi
    fi

    # Update Package.swift file
    if [[ -f "$swiftFile" ]]; then
        echo "Updating $swiftFile"
        swiftContent=$(cat $swiftFile)
        swiftRegex='(getsentry\/sentry-cocoa\", from: \")([0-9.]+)'
        if [[ $swiftContent =~ $swiftRegex ]]; then
            newValue="${BASH_REMATCH[1]}$2"
            echo "${swiftContent/${BASH_REMATCH[0]}/$newValue}" >$swiftFile
            echo "Updated $swiftFile with version $2"
        fi
    fi
    ;;
*)
    echo "Unknown argument $1"
    echo "Usage: $0 {get-version|get-repo|set-version <version>}"
    exit 1
    ;;
esac
