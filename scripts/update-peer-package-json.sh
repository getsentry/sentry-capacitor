#reuses update-package-json, only informing it that we are updating the peerDependencies instead of dependencies/devDependencies.

echo "Updating peerDependencies"
packages=peerPackages
updatePeerPackages=true
. $(dirname "$0")/update-package-json.sh
