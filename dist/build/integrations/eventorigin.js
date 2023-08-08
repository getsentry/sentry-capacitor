Object.defineProperty(exports, "__esModule", { value: true });
exports.EventOrigin = void 0;
/** Default EventOrigin instrumentation */
var EventOrigin = /** @class */ (function () {
    function EventOrigin() {
        /**
         * @inheritDoc
         */
        this.name = EventOrigin.id;
    }
    /**
     * @inheritDoc
     */
    EventOrigin.prototype.setupOnce = function (addGlobalEventProcessor) {
        addGlobalEventProcessor(function (event) {
            var _a;
            event.tags = (_a = event.tags) !== null && _a !== void 0 ? _a : {};
            event.tags['event.origin'] = 'javascript';
            event.tags['event.environment'] = 'javascript';
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    EventOrigin.id = 'EventOrigin';
    return EventOrigin;
}());
exports.EventOrigin = EventOrigin;
//# sourceMappingURL=eventorigin.js.map