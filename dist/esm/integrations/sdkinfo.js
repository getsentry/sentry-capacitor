import { __awaiter } from "tslib";
import { logger } from '@sentry/utils';
import { SDK_NAME, SDK_VERSION } from '../version';
import { NATIVE } from '../wrapper';
/** Default SdkInfo instrumentation */
export class SdkInfo {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = SdkInfo.id;
        this._nativeSdkPackage = null;
    }
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor) {
        addGlobalEventProcessor((event) => __awaiter(this, void 0, void 0, function* () {
            // The native SDK info package here is only used on iOS as `beforeSend` is not called on `captureEnvelope`.
            // this._nativeSdkInfo should be defined a following time so this call won't always be awaited.
            if (NATIVE.platform === 'ios' && this._nativeSdkPackage === null) {
                try {
                    this._nativeSdkPackage = yield NATIVE.fetchNativeSdkInfo();
                }
                catch (_) {
                    // If this fails, go ahead as usual as we would rather have the event be sent with a package missing.
                    logger.warn('[SdkInfo] Native SDK Info retrieval failed...something could be wrong with your Sentry installation.');
                }
            }
            event.platform = event.platform || 'javascript';
            event.sdk = event.sdk || {};
            event.sdk.name = event.sdk.name || SDK_NAME;
            event.sdk.version = event.sdk.version || SDK_VERSION;
            event.sdk.packages = [
                // default packages are added by baseclient and should not be added here
                ...(event.sdk.packages || []),
                ...((this._nativeSdkPackage && [this._nativeSdkPackage]) || []),
                {
                    name: 'npm:@sentry/capacitor',
                    version: SDK_VERSION,
                },
            ];
            return event;
        }));
    }
}
/**
 * @inheritDoc
 */
SdkInfo.id = 'SdkInfo';
//# sourceMappingURL=sdkinfo.js.map