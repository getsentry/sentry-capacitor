/** Default EventOrigin instrumentation */
export class EventOrigin {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = EventOrigin.id;
    }
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor) {
        addGlobalEventProcessor(event => {
            var _a;
            event.tags = (_a = event.tags) !== null && _a !== void 0 ? _a : {};
            event.tags['event.origin'] = 'javascript';
            event.tags['event.environment'] = 'javascript';
            return event;
        });
    }
}
/**
 * @inheritDoc
 */
EventOrigin.id = 'EventOrigin';
//# sourceMappingURL=eventorigin.js.map