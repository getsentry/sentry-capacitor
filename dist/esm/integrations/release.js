import { NATIVE } from '../wrapper';
const INTEGRATION_NAME = 'Release';
export const nativeReleaseIntegration = () => {
    return {
        name: INTEGRATION_NAME,
        processEvent: processEvent,
    };
};
async function processEvent(event, _, client) {
    const options = client.getOptions();
    /*
      Check for the release and dist in the options passed on init.
      Otherwise, we get the release and dist from the native package.
    */
    if (typeof (options === null || options === void 0 ? void 0 : options.release) === 'string') {
        event.release = options.release;
    }
    if (typeof (options === null || options === void 0 ? void 0 : options.dist) === 'string') {
        event.dist = options.dist;
    }
    if (event.release && event.dist) {
        return event;
    }
    try {
        const nativeRelease = await NATIVE.fetchNativeRelease();
        if (nativeRelease) {
            if (!event.release) {
                event.release = `${nativeRelease.id}@${nativeRelease.version}+${nativeRelease.build}`;
            }
            if (!event.dist) {
                event.dist = `${nativeRelease.build}`;
            }
        }
    }
    catch (_Oo) {
        // Something went wrong, we just continue
    }
    return event;
}
//# sourceMappingURL=release.js.map