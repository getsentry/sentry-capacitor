#!/usr/bin/env bash
set -euo pipefail

tagPrefix=''
repo="https://github.com/getsentry/sentry-javascript.git"
packages=('@sentry/browser' '@sentry/core' '@sentry/integrations' '@sentry/types' '@sentry/utils')
#TODO: remove @sentry/hub and @sentry/tracing on next major release.
#https://github.com/getsentry/sentry-capacitor/issues/511
packages+=('@sentry/hub' '@sentry/tracing')
packages+=('@sentry-internal/eslint-config-sdk' '@sentry-internal/eslint-plugin-sdk' '@sentry-internal/typescript')
. $(dirname "$0")/update-package-json.sh
