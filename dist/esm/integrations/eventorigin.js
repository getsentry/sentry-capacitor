const INTEGRATION_NAME = 'EventOrigin';
export const eventOriginIntegration = () => {
    return {
        name: INTEGRATION_NAME,
        preprocessEvent: processEvent,
    };
};
async function processEvent(event) {
    var _a;
    event.tags = (_a = event.tags) !== null && _a !== void 0 ? _a : {};
    event.tags['event.origin'] = 'javascript';
    event.tags['event.environment'] = 'javascript';
    return event;
}
//# sourceMappingURL=eventorigin.js.map