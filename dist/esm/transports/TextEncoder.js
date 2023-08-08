import { utf8ToBytes } from '../vendor';
export const makeUtf8TextEncoder = () => {
    const textEncoder = {
        encode: (text) => {
            const bytes = new Uint8Array(utf8ToBytes(text));
            return bytes;
        },
        encoding: 'utf-8',
    };
    return textEncoder;
};
//# sourceMappingURL=TextEncoder.js.map