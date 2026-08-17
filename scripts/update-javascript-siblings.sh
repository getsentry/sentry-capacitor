#!/usr/bin/env bash
set -euo pipefail

scriptDir="$(cd "$(dirname "$0")" && pwd)"
rootDir="$(cd "$scriptDir/.." && pwd)"

tagPrefix=''
# @sentry/react|vue|angular are real peerDependencies of the SDK itself, but plain
# regular dependencies in the sample apps under example/ - only use `yarn add --peer`
# at the SDK root.
if [[ "$rootDir" == */example/* ]]; then
    updatePeerPackages=0
else
    updatePeerPackages=1
fi
repo="https://github.com/getsentry/sentry-javascript.git"
packages=('@sentry/react' '@sentry/vue' '@sentry/angular')

. "$scriptDir/update-package-json.sh"

# Update sample apps if they need any update
if [[ "$rootDir" != */example/* ]]; then
    if [[ "${1:-}" == "set-version" ]]; then
        for sampleScript in "$rootDir"/example/ionic-*/scripts/update-javascript-siblings.sh; do
            if [[ -f "$sampleScript" ]]; then
                echo "Updating sample app: $(dirname "$(dirname "$sampleScript")")"
                "$sampleScript" "$@"
            fi
        done
    fi
fi
