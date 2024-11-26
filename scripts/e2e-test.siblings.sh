#!/bin/bash

# Publish with yalc
yalc publish --sig

# Navigate to siblingsTests and publish without modifying package.json
cd e2e-test/scripts/siblingsTests/

rm -r .yalc
rm -r node_modules

cp package.json package.json.bak

yalc add @sentry/capacitor

rm yalc.lock
rm package.json
mv package.json.bak package.json

cd ../../..

# Run Jest
jest -c jest.e2e.config.js
