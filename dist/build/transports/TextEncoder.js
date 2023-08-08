Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUtf8TextEncoder = void 0;
var vendor_1 = require("../vendor");
exports.makeUtf8TextEncoder = function () {
    var textEncoder = {
        encode: function (text) {
            var bytes = new Uint8Array(vendor_1.utf8ToBytes(text));
            return bytes;
        },
        encoding: 'utf-8',
    };
    return textEncoder;
};
//# sourceMappingURL=TextEncoder.js.map