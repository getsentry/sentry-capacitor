# expects `$repo`, `$tagPrefix` and `$packages` (array) variables to be defined, see e.g. update-javascript.sh

file="$(dirname "$0")/../package.json"
content=$(cat $file)
updatePeerPackages=${updatePeerPackages:-0}

case $1 in
get-version)
    regex='"'${packages[0]}'": *"\^?([0-9.]+)"'
    if ! [[ $content =~ $regex ]]; then
        echo "Failed to find plugin '${packages[0]}' version in $file"
        exit 1
    fi
    echo $tagPrefix${BASH_REMATCH[1]}
    ;;
get-repo)
    echo $repo
    ;;
set-version)
    list=""
    version="$2"
    # remove $tagPrefix from the $version by skipping the first `strlen($tagPrefix)` characters
    if [[ "$version" == "$tagPrefix"* ]]; then
        version="${version:${#tagPrefix}}"
    fi
    for i in ${!packages[@]}; do
        # Only add packages that exist in package.json
        if [[ $content =~ \"${packages[$i]}\": ]]; then
            list+="${packages[$i]}@$version "
        fi
    done
    if [[ -n "$list" ]]; then
        (
            cd "$(dirname "$file")"
            if [ "$updatePeerPackages" -eq 1 ]; then
                #upgrade doesn't support peerDependencies so we'll use the yarn option.
                UPDATE_SENTRY_CAPACITOR=1 yarn add --peer $list
            else
                UPDATE_SENTRY_CAPACITOR=1 yarn up $list
            fi
        )
    fi
    ;;
*)
    echo "Unknown argument $1"
    exit 1
    ;;
esac
