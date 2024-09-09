#!/usr/bin/env bash
set -euo pipefail

tagPrefix=''
updatePeerPackages=1
repo="https://github.com/getsentry/sentry-javascript.git"
packages=('@sentry/react' '@sentry/vue' '@sentry/angular')
. $(dirname "$0")/update-package-json.sh
