#!/usr/bin/env bash
set -euo pipefail

scriptDir="$(cd "$(dirname "$0")" && pwd)"
rootDir="$(cd "$scriptDir/.." && pwd)"

tagPrefix=''
updatePeerPackages=1
repo="https://github.com/getsentry/sentry-javascript.git"
packages=('@sentry/react' '@sentry/vue' '@sentry/angular')

. "$scriptDir/update-package-json.sh"

# Update sample apps if they need any update
if [[ "$scriptDir" == "$rootDir/scripts" ]]; then
    updatePeerPackages=0
    if [[ "${1:-}" == "set-version" ]]; then
        for sampleScript in "$rootDir"/example/ionic-*/scripts/update-javascript-siblings.sh; do
            if [[ -f "$sampleScript" ]]; then
                echo "Updating sample app: $(dirname "$(dirname "$sampleScript")")"
                "$sampleScript" "$@"
            fi
        done
    fi
fi
