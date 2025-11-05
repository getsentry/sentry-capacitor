#READ version from package.json
$FILE="package.json"

VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$FILE" \
  | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

FILE_PATH="~/.yalc/packages/@sentry/capacitor/$VERSION"
# delete yalc cache.

if -z $FILE_PATH; then
  rm -rf ~/.yalc/packages/@sentry/capacitor/$VERSION
fi
